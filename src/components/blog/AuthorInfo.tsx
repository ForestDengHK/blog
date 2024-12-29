'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import type { Profile } from '@/types/database';

interface AuthorInfoProps {
  author: Profile;
  createdAt: string;
}

export default function AuthorInfo({ author, createdAt }: AuthorInfoProps) {
  const defaultAvatar = '/images/default-avatar.svg';
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div className="flex items-center space-x-3 mb-2">
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
        <Image
          src={author.avatar_url || defaultAvatar}
          alt={author.username}
          fill
          className="object-cover"
        />
      </div>
      <div>
        <div className="font-medium text-gray-900">
          {author.full_name || author.username}
        </div>
        <div className="text-sm text-gray-500">{timeAgo}</div>
      </div>
    </div>
  );
} 