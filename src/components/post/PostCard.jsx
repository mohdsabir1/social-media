'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, MoreVertical, Pencil, Trash2, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MediaSlider } from './MediaSlider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PostCard = ({ post, currentUserId, className = '', onDelete, onEdit, variant = 'feed' }) => {
  const router = useRouter();
  const [isLiked] = useState(post.likes?.includes(currentUserId));
  const likesCount = post.likes?.length || 0;
  const commentsCount = post.comments?.length || 0;
  const isOwnPost = post.author._id === currentUserId;

  if (variant === 'grid') {
    return (
      <div 
        className="relative aspect-square cursor-pointer group"
        onClick={() => router.push(`/post/${post._id}`)}
      >
        {post.media && post.media[0] && (
          <div className="relative w-full h-full">
            <Image
              src={post.media[0]}
              alt={post.author?.username ? `Post by ${post.author.username}` : 'Post image'}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex items-center gap-6 text-white">
                <div className="flex items-center gap-2">
                  <Heart className="h-6 w-6" />
                  <span>{likesCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  <span>{commentsCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    router.push(`/post/${post._id}`);
  };

  return (
    <Card className={`overflow-hidden ${className}`} onClick={handleClick}>
      {/* Author Info */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <Image
              src={post.author?.profilePicture || '/default-avatar.png'}
              alt={post.author?.username ? `${post.author.username}'s profile picture` : 'User profile picture'}
              fill
              className="rounded-full object-cover"
              sizes="32px"
            />
          </div>
          <div>
            <p className="font-semibold text-sm">{post.author?.username}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {isOwnPost && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(post)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(post._id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="relative aspect-square">
          <MediaSlider media={post.media} />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <p className="text-sm mb-2">{post.content}</p>
        
        {/* Actions */}
        <div className="flex items-center gap-4 py-2">
          <button className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : ''}`}>
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likesCount}</span>
          </button>
          <button className="flex items-center gap-1">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">{commentsCount}</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
