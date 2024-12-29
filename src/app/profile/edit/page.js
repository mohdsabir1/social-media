'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { ArrowLeft } from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({
    fullName: '',
    bio: '',
    gender: '',
    dateOfBirth: '',
    profilePicture: '',
    coverPicture: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUserData({
        fullName: data.fullName || '',
        bio: data.bio || '',
        gender: data.gender || '',
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
        profilePicture: data.profilePicture || '',
        coverPicture: data.coverPicture || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/auth/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      router.push('/profile');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const handleImageUpload = (type) => (data) => {
    setUserData(prev => ({
      ...prev,
      [type === 'profile' ? 'profilePicture' : 'coverPicture']: data[type === 'profile' ? 'profilePicture' : 'coverPicture']
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground mt-2">Update your profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/2 space-y-4">
                <div>
                  <label className="text-sm font-medium">Profile Picture</label>
                  <ImageUpload
                    type="profile"
                    defaultImage={userData.profilePicture}
                    onUpload={handleImageUpload('profile')}
                    aspectRatio="aspect-square"
                    size={{ width: 200, height: 200 }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Cover Picture</label>
                  <ImageUpload
                    type="cover"
                    defaultImage={userData.coverPicture}
                    onUpload={handleImageUpload('cover')}
                    aspectRatio="aspect-[3/1]"
                    size={{ width: 300, height: 100 }}
                  />
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    type="text"
                    value={userData.fullName}
                    onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <textarea
                    className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={userData.bio}
                    onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender</label>
                  <select
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={userData.gender}
                    onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <Input
                    type="date"
                    value={userData.dateOfBirth}
                    onChange={(e) => setUserData({ ...userData, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/profile')}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
