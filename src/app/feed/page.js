'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
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
  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    setLoading(true); // Set loading to true before fetching
    fetchPosts();
    fetchUser();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      setError('');
    }
  }, [posts]);

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
            profilePicture: post.author.profilePicture || '/default-avatar.png'
          }
        })));
      } else {
        setError('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Error loading posts');
    } finally {
      setLoading(false); // Make sure to set loading to false in finally block
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && mediaFiles.length === 0) return;

    setLoading(true);
    try {
      // First, upload media files if any
      let mediaUrls = [];
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        for (let file of mediaFiles) {
          formData.append('media', file);
        }

        console.log('Uploading media files...', mediaFiles.length);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload media');
        }

        const uploadData = await uploadResponse.json();
        console.log('Upload response:', uploadData);
        mediaUrls = uploadData.urls || [];
      }

      // Create post with text and media URLs
      const postData = {
        content: newPost,
        media: mediaUrls.map(url => ({
          type: url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? 'image' : 'video',
          url,
        })),
      };

      console.log('Creating post with data:', postData);
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      setNewPost('');
      setMediaFiles([]);
      await fetchPosts(); // Refetch posts after successful creation
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message || 'Failed to create post');
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

  const formatContent = (content) => {
    return content.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-indigo-600 hover:underline cursor-pointer">
            {word}{' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  const handleComment = async (postId, parentCommentId = null) => {
    try {
      const content = parentCommentId ? replyContent : comment;
      if (!content.trim()) return;

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
        const error = await response.json();
        throw new Error(error.error || 'Failed to add comment');
      }

      // Reset states
      setComment('');
      setReplyContent('');
      setReplyingTo(null);
      
      // Refresh posts to show new comment
      await fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.message);
    }
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    // Validate file types
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });
    
    if (validFiles.length !== files.length) {
      setError('Some files were not accepted. Only images and videos are allowed.');
    }
    
    setMediaFiles(validFiles);

    // Create preview URLs
    const previews = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));
    setMediaPreview(previews);
  };

  useEffect(() => {
    return () => {
      mediaPreview.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [mediaPreview]);

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} />
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} />
      
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6">
        {/* Create Post Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="relative h-10 w-10 flex-shrink-0">
              <Image
                src={user?.profilePicture || '/default-avatar.png'}
                alt={user?.fullName || 'User'}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full min-h-[60px] p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
              
              {/* Media Preview */}
              {mediaPreview.length > 0 && (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {mediaPreview.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="rounded-lg object-cover"
                      />
                      <button
                        onClick={() => removeMedia(index)}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2">
                  <label className="cursor-pointer text-indigo-600 hover:text-indigo-700 flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMediaChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={(!newPost.trim() && mediaFiles.length === 0) || loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                >
                  {loading ? <Spinner className="h-5 w-5" /> : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
              {error}
            </div>
          )}
          
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative h-10 w-10">
                    <Image
                      src={post.author.profilePicture}
                      alt={post.author.fullName}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{post.author.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {post.author._id === user?._id && (
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Post Content */}
              <p className="p-4">{formatContent(post.content)}</p>

              {/* Post Media */}
              {post.media && post.media.length > 0 && (
                <MediaSlider media={post.media} />
              )}

              {/* Post Actions */}
              <div className="p-4 flex items-center justify-between border-t border-b py-2">
                <button
                  onClick={() => handleLike(post._id)}
                  className="flex items-center space-x-2"
                >
                  {post.likes?.includes(user?._id) ? (
                    <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-500 stroke-current fill-none" viewBox="0 0 24 24">
                      <path strokeWidth="2" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  )}
                  <span>{post.likes?.length || 0} likes</span>
                </button>
                <button className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <span>{post.comments?.length || 0} comments</span>
                </button>
              </div>

              {/* Comments Section */}
              <div className="space-y-4 p-4">
                {post.comments && post.comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-2">
                    <div className="relative h-8 w-8">
                      <Image
                        src={comment.author.profilePicture || '/default-avatar.png'}
                        alt={comment.author.fullName}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="font-semibold text-sm">{comment.author.fullName}</p>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      
                      {/* Reply button and form */}
                      <div className="mt-1">
                        <button
                          onClick={() => setReplyingTo(comment._id)}
                          className="text-xs text-gray-500 hover:text-indigo-600"
                        >
                          Reply
                        </button>
                        
                        {replyingTo === comment._id && (
                          <div className="flex items-center mt-2 ml-8 space-x-2">
                            <div className="relative h-6 w-6 flex-shrink-0">
                              <Image
                                src={user?.profilePicture || '/default-avatar.png'}
                                alt={user?.fullName}
                                fill
                                className="rounded-full object-cover"
                              />
                            </div>
                            <div className="flex flex-1 items-center space-x-2">
                              <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 border rounded-full px-3 py-1 text-sm focus:outline-none focus:border-indigo-500"
                              />
                              <button
                                onClick={() => handleComment(post._id, comment._id)}
                                disabled={!replyContent.trim()}
                                className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50 px-3 py-1 text-sm"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Nested replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8 mt-2 space-y-2">
                          {comment.replies.map((reply, index) => (
                            <div key={index} className="flex space-x-2">
                              <div className="relative h-6 w-6 flex-shrink-0">
                                <Image
                                  src={reply.author.profilePicture || '/default-avatar.png'}
                                  alt={reply.author.fullName}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                              <div className="flex-1 bg-gray-50 rounded-lg p-2">
                                <p className="font-semibold text-xs">{reply.author.fullName}</p>
                                <p className="text-xs">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Main comment form */}
                <div className="flex items-center space-x-2">
                  <div className="relative h-8 w-8 flex-shrink-0">
                    <Image
                      src={user?.profilePicture || '/default-avatar.png'}
                      alt={user?.fullName}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 items-center space-x-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 border rounded-full px-4 py-1 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleComment(post._id)}
                      disabled={!comment.trim()}
                      className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50 px-4 py-1"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
