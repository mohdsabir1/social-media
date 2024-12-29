'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, MoreVertical, Pencil, Trash2, Send, X } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { PostCard } from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function ProfilePage({ params }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    const fetchUserAndPosts = async () => {
      try {
        const userResponse = await fetch(`/api/users/${params.id}`);
        if (!userResponse.ok) throw new Error('Failed to fetch user');
        const userData = await userResponse.json();
        setUser(userData);

        const postsResponse = await fetch(`/api/users/${params.id}/posts`);
        if (!postsResponse.ok) throw new Error('Failed to fetch posts');
        const postsData = await postsResponse.json();
        setPosts(postsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    if (params.id) {
      fetchUserAndPosts();
    }
  }, [params.id]);

  const handlePostDelete = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter(post => post._id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handlePostEdit = (post) => {
    setEditingPost(post);
    setEditedContent(post.content);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPost || !editedContent.trim()) return;

    try {
      const response = await fetch(`/api/posts/${editingPost._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editedContent,
        }),
      });

      if (response.ok) {
        setPosts(posts.map(post => 
          post._id === editingPost._id ? { ...post, content: editedContent } : post
        ));
        setEditDialogOpen(false);
        setEditingPost(null);
        setEditedContent('');
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                <Image
                  src={user.profilePicture}
                  alt={user.username}
                  fill
                  sizes="(max-width: 768px) 96px, 128px"
                  className="rounded-full object-cover"
                  priority
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                  {currentUser?._id === user._id && (
                    <Button variant="outline">Edit Profile</Button>
                  )}
                </div>
                <div className="flex items-center gap-6 mb-4">
                  <div className="text-center">
                    <div className="font-semibold">{posts.length}</div>
                    <div className="text-gray-500 text-sm">posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{user.followers?.length || 0}</div>
                    <div className="text-gray-500 text-sm">followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{user.following?.length || 0}</div>
                    <div className="text-gray-500 text-sm">following</div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-1">{user.fullName}</div>
                  <div className="text-gray-600 whitespace-pre-wrap">{user.bio}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={currentUser?._id}
              onDelete={handlePostDelete}
              onEdit={handlePostEdit}
            />
          ))}
        </div>

        {/* Edit Post Dialog */}
        {editDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Edit Post</h2>
                <button
                  onClick={() => setEditDialogOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="What's on your mind?"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditDialogOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editedContent.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
