import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { saveFile, validateFile } from '@/lib/upload';
import connectDB from '@/lib/db';
import User from '@/models/User';

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

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // 'profile' or 'cover'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!['profile', 'cover'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid image type' },
        { status: 400 }
      );
    }

    // Validate file
    try {
      validateFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });
    } catch (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Save file
    const folder = type === 'profile' ? 'profile-pictures' : 'cover-pictures';
    const filepath = await saveFile(file, folder);

    // Update user in database
    await connectDB();
    const updateField = type === 'profile' ? 'profilePicture' : 'coverPicture';
    const user = await User.findByIdAndUpdate(
      userId,
      { [updateField]: filepath },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Image uploaded successfully',
      [updateField]: filepath,
      user
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
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
