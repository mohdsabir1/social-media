import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { validateFile, saveFile } from '@/lib/upload';

export const config = {
  api: {
    bodyParser: false
  }
};

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
    const files = formData.getAll('media');
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const urls = [];
    for (const file of files) {
      try {
        // Validate each file
        validateFile(file, {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/quicktime'
          ]
        });

        // Save file and get URL
        const url = await saveFile(file, 'posts');
        urls.push(url);
      } catch (error) {
        console.error('Error processing file:', error);
        return NextResponse.json(
          { error: `Error processing file: ${error.message}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
