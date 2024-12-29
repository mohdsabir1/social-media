'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import PostCard from "@/components/post/PostCard";
import { Spinner } from "@/components/ui/spinner";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      if (!user?._id) return;
      const response = await fetch('/api/posts/user');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout');
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
      router.push('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
          <p className="mt-2 text-gray-600">Please try logging in again</p>
          <Button className="mt-4" onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          onClick={() => router.push('/feed')}
          variant="ghost"
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Feed
        </Button>

        {/* Profile Section */}
        <div className="bg-white rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            {/* Profile Image - Full width on mobile, left side on desktop */}
            <div className="mx-auto sm:mx-0">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={`Profile picture of ${user.username || 'user'}`}
                    fill
                    className="rounded-full object-cover"
                    sizes="(max-width: 640px) 128px, 160px"
                    priority
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-bold text-muted-foreground">
                      {user.fullName?.charAt(0) || user.username?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right - User Info */}
            <div className="flex-1 text-center sm:text-left">
              {/* Username, Post Count and Menu */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl sm:text-2xl font-semibold">{user.username}</h1>
                  <span className="text-gray-600">{posts.length} posts</span>
                </div>
                <div className="sm:ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push('/profile/edit')}>
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2 mb-4">
                <h2 className="font-semibold">{user.fullName}</h2>
                <p className="text-gray-600">{user.bio || 'No bio yet'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={user._id}
              showComments={false}
            />
          ))}
          {posts.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
