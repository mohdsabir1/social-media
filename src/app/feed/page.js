'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { MediaSlider } from '@/components/post/MediaSlider';
import { Button } from '@/components/ui/button';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);
  const [error, setError] = useState('');
  const [showCommentsForPost, setShowCommentsForPost] = useState(null);
  const [newComments, setNewComments] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchPosts();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts.map(post => ({
          ...post,
          author: {
            ...post.author,
            profilePicture: post.author.profilePicture 
          }
        })));
      } else {
        setError('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Error loading posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && mediaFiles.length === 0) return;

    setLoading(true);
    try {
      let mediaUrls = [];
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        for (let file of mediaFiles) {
          formData.append('media', file);
        }

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload media');
        }

        const uploadData = await uploadResponse.json();
        mediaUrls = uploadData.urls || [];
      }

      const postData = {
        content: newPost,
        media: mediaUrls.map(url => ({
          type: url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? 'image' : 'video',
          url,
        })),
      };

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      setNewPost('');
      setMediaFiles([]);
      setMediaPreview([]);
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId, parentCommentId = null) => {
    const content = parentCommentId ? replyContent : newComments[postId];
    if (!content?.trim()) return;

    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content,
          parentCommentId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      // Reset states
      setNewComments(prev => ({ ...prev, [postId]: '' }));
      setReplyContent('');
      setReplyingTo(null);
      
      await fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    setMediaFiles(validFiles);
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setMediaPreview(previews);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} />
      
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6">
        {/* Create Post Form */}
        <form onSubmit={handleSubmit} className="mb-8 bg-white rounded-lg shadow p-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          />
          <div className="mt-2">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="hidden"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="inline-block px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
            >
              Add Photos/Videos
            </label>
          </div>
          {mediaPreview.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {mediaPreview.map((url, index) => (
                <div key={index} className="relative w-20 h-20">
                  <Image
                    src={url}
                    alt={`Media preview ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 80px, 80px"
                    className="rounded object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || (!newPost.trim() && mediaFiles.length === 0)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </form>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow">
              {/* Post Header */}
              <div className="p-4 flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <Image
                    src={post.author.profilePicture}
                    alt={`${post.author.username}'s profile picture`}
                    fill
                    sizes="(max-width: 768px) 40px, 40px"
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{post.author.username}</h3>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <p className="px-4 py-2">{post.content}</p>

              {/* Post Media */}
              {post.media && post.media.length > 0 && (
                <div className="relative aspect-square">
                  <MediaSlider media={post.media} />
                </div>
              )}

              {/* Post Actions */}
              <div className="p-4 border-t">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center gap-1 hover:text-red-500 transition-colors"
                  >
                    <Heart className={`h-5 w-5 ${post.likes.includes(user?._id) ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{post.likes.length}</span>
                  </button>
                  <button
                    onClick={() => setShowCommentsForPost(showCommentsForPost === post._id ? null : post._id)}
                    className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments.length}</span>
                  </button>
                </div>

                {/* Comments Section - Only show for the selected post */}
                {showCommentsForPost === post._id && (
                  <div className="mt-4 border-t pt-4">
                    <div className="max-h-60 overflow-y-auto space-y-4">
                      {post.comments.map((comment, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="relative w-8 h-8 flex-shrink-0">
                            <Image
                              src={comment.author?.profilePicture}
                              alt={`${comment.author?.username || 'User'}'s profile picture`}
                              fill
                              sizes="(max-width: 768px) 32px, 32px"
                              className="rounded-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-2xl px-4 py-2">
                              <p className="font-semibold text-sm">{comment.author?.username}</p>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </p>
                              <button
                                onClick={() => setReplyingTo(comment._id)}
                                className="text-xs text-gray-500 hover:text-blue-500"
                              >
                                Reply
                              </button>
                            </div>

                            {/* Reply Form */}
                            {replyingTo === comment._id && (
                              <div className="mt-2 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder="Write a reply..."
                                  className="flex-1 px-3 py-1 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => handleComment(post._id, comment._id)}
                                  disabled={!replyContent.trim()}
                                  className="p-1 text-blue-500 hover:text-blue-600 disabled:opacity-50"
                                >
                                  <Send className="h-4 w-4" />
                                </button>
                              </div>
                            )}

                            {/* Nested Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="ml-8 mt-2 space-y-2">
                                {comment.replies.map((reply, replyIndex) => (
                                  <div key={replyIndex} className="flex items-start gap-2">
                                    <div className="relative w-6 h-6 flex-shrink-0">
                                      <Image
                                        src={reply.author?.profilePicture }
                                        alt={`${reply.author?.username || 'User'}'s profile picture`}
                                        fill
                                        sizes="(max-width: 768px) 24px, 24px"
                                        className="rounded-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="bg-gray-100 rounded-2xl px-3 py-1">
                                        <p className="font-semibold text-xs">{reply.author?.username}</p>
                                        <p className="text-xs">{reply.content}</p>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add Comment Form */}
                    <div className="mt-4 flex items-center gap-2">
                      <input
                        type="text"
                        value={newComments[post._id] || ''}
                        onChange={(e) => setNewComments(prev => ({ ...prev, [post._id]: e.target.value }))}
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleComment(post._id)}
                        disabled={!newComments[post._id]?.trim()}
                        className="p-2 text-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
