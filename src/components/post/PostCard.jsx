'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MediaSlider } from './MediaSlider';

const PostCard = ({ post, currentUserId, className = '' }) => {
  const router = useRouter();
  const [isLiked] = useState(post.likes?.includes(currentUserId));
  const likesCount = post.likes?.length || 0;
  const commentsCount = post.comments?.length || 0;

  const handleClick = () => {
    router.push(`/post/${post._id}`);
  };

  return (
    <Card 
      className={`cursor-pointer hover:opacity-95 transition-opacity ${className}`}
      onClick={handleClick}
    >
      {/* Media */}
      <div className="relative aspect-square">
        {post.media && post.media.length > 0 ? (
          <MediaSlider media={post.media} />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No media</span>
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-sm">{likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{commentsCount}</span>
          </div>
        </div>
        {/* Brief caption */}
        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
          <span className="font-semibold text-gray-900">{post.author?.username}</span>
          {' '}{post.content}
        </p>
      </div>
    </Card>
  );
};

export default PostCard;
