'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, MoreHorizontal, X } from 'lucide-react';
import PostCard from "@/components/post/PostCard";
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          if (userData?._id) {
            await fetchUserPosts(userData._id);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const fetchUserPosts = async (userId) => {
    try {
      const response = await fetch(`/api/posts/user/${userId}`);
      if (response.ok) {
        const postsData = await response.json();
        setPosts(Array.isArray(postsData) ? postsData : []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
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

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <button 
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32">
          <Image
            src={user?.profilePicture || '/default-avatar.png'}
            alt={user?.username || 'User'}
            fill
            className="rounded-full object-cover"
            priority
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">{user?.username}</h1>
            <div className="flex items-center gap-4">
            <Link href="/profile/edit">
  <button className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors">
    Edit Profile
  </button>
</Link>
              
            </div>
          </div>
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <div className="font-semibold">{posts.length}</div>
              <div className="text-gray-500 text-sm">posts</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{user?.followers?.length || 0}</div>
              <div className="text-gray-500 text-sm">followers</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{user?.following?.length || 0}</div>
              <div className="text-gray-500 text-sm">following</div>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-1">{user?.fullName}</div>
            <div className="text-gray-600 whitespace-pre-wrap">{user?.bio || '#hii'}</div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={user._id}
              onDelete={handlePostDelete}
              onEdit={handlePostEdit}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts yet</p>
          </div>
        )}
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
    </div>
  );
}
