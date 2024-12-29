import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    
    const userId = await getAuthUser(request);
    console.log('User ID from auth:', userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'fullName profilePicture')
      .populate('comments.author', 'fullName profilePicture')
      .populate('comments.replies.author', 'fullName profilePicture');

    console.log(`Found ${posts.length} posts for user ${userId}`);
    
    return NextResponse.json({ 
      posts,
      userId: userId // Include userId in response for debugging
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user posts', details: error.message },
      { status: 500 }
    );
  }
}
