import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { getAuthUser } from '@/lib/auth';

// Add a comment or reply to a post
export async function POST(request, { params }) {
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

    const { content, parentCommentId } = await request.json();
    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    let newComment;
    if (parentCommentId) {
      // This is a reply to an existing comment
      const parentComment = post.comments.id(parentCommentId);
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }

      // Add reply to the parent comment
      parentComment.replies.push({
        author: userId,
        content,
        createdAt: new Date()
      });

      newComment = parentComment.replies[parentComment.replies.length - 1];
    } else {
      // This is a new top-level comment
      newComment = {
        author: userId,
        content,
        replies: [],
        createdAt: new Date()
      };
      post.comments.push(newComment);
    }

    await post.save();
    
    // Populate author details for the new comment/reply
    await post.populate('comments.author comments.replies.author', 'fullName profilePicture');

    return NextResponse.json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
