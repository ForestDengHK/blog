'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Post, Profile } from '@/types/database';
import AuthorInfo from './AuthorInfo';
import PostActions from './PostActions';

interface PostCardProps {
  post: Post & {
    author: Profile;
    likes_count: number;
    comments_count: number;
    is_liked: boolean;
    is_saved: boolean;
  };
  userId: string | null;
}

export default function PostCard({ post, userId }: PostCardProps) {
  const excerpt = post.excerpt || post.content.slice(0, 200) + '...';

  return (
    <article className="border-b border-gray-200 pb-8 mb-8">
      <AuthorInfo author={post.author} createdAt={post.created_at} />

      <Link href={`/blog/${post.slug}`} className="group">
        <div className="grid grid-cols-12 gap-4">
          <div className={post.cover_image_url ? "col-span-8" : "col-span-12"}>
            <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600">
              {post.title}
            </h2>
            <p className="text-gray-600 mb-4">{excerpt}</p>
          </div>

          {post.cover_image_url && (
            <div className="col-span-4">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={post.cover_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-4">
        <PostActions
          postId={post.id}
          userId={userId}
          initialLikes={post.likes_count}
          initialComments={post.comments_count}
          initialIsLiked={post.is_liked}
          initialIsSaved={post.is_saved}
        />
      </div>
    </article>
  );
} 