'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Post } from '@/types/database';
import { format } from 'date-fns';

export default function MyPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    fetchPosts();
  }, [user, router]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      alert('Failed to fetch posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (post: Post) => {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (!session) {
        router.push('/auth/sign-in');
        return;
      }

      // Perform the update
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          published: !post.published,
          updated_at: new Date().toISOString()
        })
        .match({ id: post.id, author_id: session.user.id });

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Update local state
      setPosts(posts.map(p => p.id === post.id ? { ...p, published: !p.published } : p));
      
      // Refresh the router to update the UI
      router.refresh();
    } catch (error: any) {
      console.error('Detailed error:', error);
      alert(error?.message || 'Failed to update post status. Please try again.');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user?.id);

      if (error) throw error;

      // Update local state
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Posts</h1>
        <Link
          href="/blog/new"
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          New Post
        </Link>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {post.title}
                </h2>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.published
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="mx-2">•</span>
                  <time dateTime={post.created_at}>
                    {format(new Date(post.created_at), 'MMMM d, yyyy')}
                  </time>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="px-3 py-1 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  View
                </Link>
                <Link
                  href={`/blog/edit/${post.slug}`}
                  className="px-3 py-1 text-sm font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handlePublishToggle(post)}
                  className="px-3 py-1 text-sm font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                >
                  {post.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="px-3 py-1 text-sm font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {post.excerpt}
            </p>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              You haven't created any posts yet.
            </p>
            <Link
              href="/blog/new"
              className="mt-4 inline-block px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Create your first post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 