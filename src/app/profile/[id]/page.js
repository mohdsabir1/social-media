'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Post from '@/components/post/Post';

export default function ProfilePage({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    if (params.id) {
      fetchUserAndPosts();
    }
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4">
        {/* Profile Section */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex gap-6">
            {/* Left - Profile Image */}
            <div className="w-40 h-40 relative flex-shrink-0">
              <Image
                src={user.profilePicture || '/default-avatar.png'}
                alt={user.username}
                fill
                className="rounded-full object-cover"
              />
            </div>

            {/* Right - User Info */}
            <div>
              {/* Username and Post Count */}
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-2xl font-semibold">{user.username}</h1>
                <span className="text-gray-600">{posts.length} posts</span>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <h2 className="font-bold">Comedy club</h2>
                <div className="flex gap-1">
                  {'😂 🤔 🥰 😎 😊 😋'.split(' ').map((emoji, i) => (
                    <span key={i}>{emoji}</span>
                  ))}
                </div>
                <div>Support us 🙏</div>
                <div>1k goal</div>
                <div>We can achieve 😊 🤓</div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 mt-4">
                <span>{user.followers?.length || 0} followers</span>
                <span>{user.following?.length || 0} following</span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Post key={post._id} post={post} user={session?.user} />
          ))}
        </div>
      </main>
    </div>
  );
}
