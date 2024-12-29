'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { MediaSlider } from '@/components/post/MediaSlider';
import { use } from 'react';
import Image from 'next/image';

export default function PostPage({ params }) {
  const router = useRouter();
  const { id: postId } = use(params);
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (response.ok) {
          const postData = await response.json();
          setPost(postData);
          setIsLiked(postData.likes?.includes(user?._id));
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchPost();
  }, [postId, user?._id]);

  const handleLike = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setPost(prev => ({
          ...prev,
          likes: isLiked 
            ? prev.likes.filter(id => id !== user._id)
            : [...prev.likes, user._id]
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;

    try {
      const response = await fetch(`/api/posts/${post._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setPost(prev => ({
          ...prev,
          comments: [...prev.comments, { ...newComment, author: user }]
        }));
        setComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Post</h1>
      </div>

      {/* Post */}
      <div className="bg-white rounded-lg shadow">
        {/* Author Info */}
        <div className="flex items-center p-4">
          <Image
            src={post.author?.profilePicture || '/default-avatar.png'}
            alt={post.author?.username || 'User'}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="ml-3">
            <p className="font-semibold">{post.author?.username}</p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="relative aspect-square">
            <MediaSlider media={post.media} />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-800">{post.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center px-4 pb-2">
          <button
            onClick={handleLike}
            className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{post.likes?.length || 0}</span>
          </button>
          <div className="flex items-center space-x-1 text-gray-500 ml-4">
            <MessageCircle className="h-5 w-5" />
            <span>{post.comments?.length || 0}</span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t">
          {/* Comment Form */}
          <form onSubmit={handleComment} className="p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 min-w-0 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" disabled={!comment.trim()}>
                Post
              </Button>
            </div>
          </form>

          {/* Comments List */}
          <div className="px-4 pb-4 space-y-4">
            {post.comments?.map((comment, index) => (
              <div key={index} className="flex space-x-3">
                <Image
                  src={comment.author?.profilePicture || '/default-avatar.png'}
                  alt={comment.author?.username || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">{comment.author?.username}</p>
                  <p className="text-gray-800">{comment.content}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
