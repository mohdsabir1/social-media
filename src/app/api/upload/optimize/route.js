import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { getAuthUser } from '@/lib/auth';
import { validateFile, saveFile } from '@/lib/upload';

export async function POST(request) {
  try {
    // Check authentication
    const userId = await getAuthUser(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // profile, cover, or post
    const width = parseInt(formData.get('width') || '800');
    const height = parseInt(formData.get('height') || '800');
    const quality = parseInt(formData.get('quality') || '80');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    try {
      validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
      });
    } catch (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Optimize image
    let optimizedBuffer;
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Determine output format
      const outputFormat = metadata.format === 'png' ? 'png' : 'jpeg';
      
      // Resize and optimize
      optimizedBuffer = await image
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        [outputFormat]({
          quality: quality,
          progressive: true
        })
        .toBuffer();

    } catch (error) {
      console.error('Error optimizing image:', error);
      return NextResponse.json(
        { error: 'Failed to optimize image' },
        { status: 500 }
      );
    }

    // Create a new file from the optimized buffer
    const optimizedFile = new File(
      [optimizedBuffer],
      file.name,
      { type: `image/${outputFormat}` }
    );

    // Save the optimized file
    const folder = type === 'profile' ? 'profile-pictures' :
                  type === 'cover' ? 'cover-pictures' : 'posts';
    
    const filepath = await saveFile(optimizedFile, folder);

    return NextResponse.json({
      message: 'Image optimized and saved successfully',
      filepath,
      size: optimizedBuffer.length
    });

  } catch (error) {
    console.error('Error in image optimization:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

// Handle large files
export const config = {
  api: {
    bodyParser: false
  }
};
