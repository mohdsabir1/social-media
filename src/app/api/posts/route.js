import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getAuthUser } from '@/lib/auth';

// Get all posts (with pagination)
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'fullName profilePicture')
      .populate('comments.author', 'fullName profilePicture')
      .populate('comments.replies.author', 'fullName profilePicture');

    const total = await Post.countDocuments();

    return NextResponse.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// Create a new post
export async function POST(request) {
  try {
    await connectDB();
    
    const userId = await getAuthUser(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content, media } = await request.json();
    
    if (!content && (!media || media.length === 0)) {
      return NextResponse.json(
        { error: 'Post must contain either text or media' },
        { status: 400 }
      );
    }

    const post = await Post.create({
      author: userId,
      content,
      media: media || []
    });

    await post.populate('author', 'fullName profilePicture');

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
