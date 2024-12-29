'use client';

import { useState } from 'react';
import { HeartIcon, BookmarkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { supabase } from '@/lib/supabase/client';

interface PostActionsProps {
  postId: string;
  userId: string | null;
  initialLikes: number;
  initialComments: number;
  initialIsLiked: boolean;
  initialIsSaved: boolean;
}

export default function PostActions({
  postId,
  userId,
  initialLikes,
  initialComments,
  initialIsLiked,
  initialIsSaved,
}: PostActionsProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [likesCount, setLikesCount] = useState(initialLikes);

  const handleLike = async () => {
    if (!userId) return;

    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: postId, user_id: userId });
        setLikesCount((prev) => prev - 1);
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: userId });
        setLikesCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      if (isSaved) {
        await supabase
          .from('saved_posts')
          .delete()
          .match({ post_id: postId, user_id: userId });
      } else {
        await supabase
          .from('saved_posts')
          .insert({ post_id: postId, user_id: userId });
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  return (
    <div className="flex items-center space-x-4 text-gray-500">
      <button
        onClick={handleLike}
        className="flex items-center space-x-1 hover:text-gray-700"
        disabled={!userId}
      >
        {isLiked ? (
          <HeartIconSolid className="w-5 h-5 text-red-500" />
        ) : (
          <HeartIcon className="w-5 h-5" />
        )}
        <span>{likesCount}</span>
      </button>

      <div className="flex items-center space-x-1">
        <ChatBubbleLeftIcon className="w-5 h-5" />
        <span>{initialComments}</span>
      </div>

      <button
        onClick={handleSave}
        className="hover:text-gray-700"
        disabled={!userId}
      >
        {isSaved ? (
          <BookmarkIconSolid className="w-5 h-5 text-blue-500" />
        ) : (
          <BookmarkIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
} 