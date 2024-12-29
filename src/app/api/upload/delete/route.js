import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { getAuthUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function DELETE(request) {
  try {
    // Check authentication
    const userId = await getAuthUser(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { filepath, type } = await request.json();

    if (!filepath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      );
    }

    // Ensure the file path is within allowed directories
    const allowedDirs = ['profile-pictures', 'cover-pictures', 'posts'];
    const fileDir = filepath.split('/')[1]; // e.g., "profile-pictures" from "/profile-pictures/image.jpg"
    
    if (!allowedDirs.includes(fileDir)) {
      return NextResponse.json(
        { error: 'Invalid file directory' },
        { status: 400 }
      );
    }

    // Get the full file path
    const fullPath = path.join(process.cwd(), 'public', filepath);

    // Delete the file
    try {
      await unlink(fullPath);
    } catch (error) {
      if (error.code !== 'ENOENT') { // Ignore if file doesn't exist
        throw error;
      }
    }

    // Update user record if it's a profile or cover picture
    if (type === 'profile' || type === 'cover') {
      await connectDB();
      const updateField = type === 'profile' ? 'profilePicture' : 'coverPicture';
      
      await User.findByIdAndUpdate(userId, {
        [updateField]: ''
      });
    }

    return NextResponse.json({
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
