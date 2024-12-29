import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getAuthUser } from '@/lib/auth';

// Get a single post
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const post = await Post.findById(params.id)
      .populate('author', 'fullName profilePicture')
      .populate('comments.author', 'fullName profilePicture')
      .populate('comments.replies.author', 'fullName profilePicture');

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// Update a post
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const userId = await getAuthUser(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const post = await Post.findById(params.id);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.author.toString() !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to update this post' },
        { status: 403 }
      );
    }

    const { content, media } = await request.json();
    
    if (content) post.content = content;
    if (media) post.media = media;

    await post.save();
    await post.populate('author', 'fullName profilePicture');

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// Delete a post
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const userId = await getAuthUser(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const post = await Post.findById(params.id);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.author.toString() !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this post' },
        { status: 403 }
      );
    }

    await post.deleteOne();

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
