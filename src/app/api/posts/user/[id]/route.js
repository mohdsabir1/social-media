import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getAuthUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const posts = await Post.find({ author: params.id })
      .populate('author', 'username fullName profilePicture')
      .sort({ createdAt: -1 });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
