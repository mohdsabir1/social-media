'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MessageCircle, Heart } from 'lucide-react';

export const ProfilePostCard = ({ post }) => {
  const router = useRouter();
  const likesCount = post.likes?.length || 0;
  const commentsCount = post.comments?.length || 0;

  return (
    <div
      onClick={() => router.push(`/post/${post._id}`)}
      className="relative aspect-square cursor-pointer group"
    >
      <div className="relative w-full h-full">
        {post.media && post.media[0] && (
          <Image
            src={post.media[0]}
            alt={`Post by ${post.author.username}`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover"
          />
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 fill-white" />
              <span className="text-lg">{likesCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 fill-white" />
              <span className="text-lg">{commentsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePostCard;
