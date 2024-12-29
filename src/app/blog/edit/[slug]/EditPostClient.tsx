'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Post } from '@/types/database';

interface EditPostClientProps {
  initialPost: Post;
}

export default function EditPostClient({ initialPost }: EditPostClientProps) {
  const [title, setTitle] = useState(initialPost.title);
  const [content, setContent] = useState(initialPost.content);
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError('You must be logged in to update a post');
        return;
      }

      const { error: updateError } = await supabase
        .from('posts')
        .update({
          title,
          content,
          excerpt: content.split('\n')[0].slice(0, 150) + '...',
          updated_at: new Date().toISOString(),
        })
        .eq('slug', initialPost.slug);

      if (updateError) {
        console.error('Error updating post:', updateError);
        setError('Failed to update post');
        return;
      }

      router.push('/blog');
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreview(!isPreview);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Post
      </h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md mb-6">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Content
            </label>
            <div className="space-x-2">
              <button
                type="button"
                onClick={handlePreviewToggle}
                className={`px-3 py-1 text-sm rounded-md ${
                  !isPreview
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={handlePreviewToggle}
                className={`px-3 py-1 text-sm rounded-md ${
                  isPreview
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {isPreview ? (
            <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 min-h-[300px]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose dark:prose-invert max-w-none"
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
            />
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/blog')}
            className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 