'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types/database';
import { CommentList } from '@/components/CommentList';

export default function ModerateComments() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<string | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    fetchPosts();
  }, [user, router]);

  const fetchPosts = async () => {
    try {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false });

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Moderate Comments
        </h1>
        <Link
          href="/blog/my-posts"
          className="text-blue-600 hover:text-blue-500"
        >
          Back to My Posts
        </Link>
      </div>

      <div className="mb-8">
        <label htmlFor="post-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Filter by Post
        </label>
        <select
          id="post-filter"
          value={selectedPost}
          onChange={(e) => setSelectedPost(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          <option value="all">All Posts</option>
          {posts.map((post) => (
            <option key={post.id} value={post.id}>
              {post.title}
            </option>
          ))}
        </select>
      </div>

      <CommentList
        postId={selectedPost === 'all' ? '' : selectedPost}
        showModeration={true}
      />
    </div>
  );
} 