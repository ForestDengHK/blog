'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface CommentFormProps {
  postId: string;
  onCommentSubmitted: () => void;
}

export function CommentForm({ postId, onCommentSubmitted }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const comment = {
        post_id: postId,
        author_name: profile?.username || user?.email?.split('@')[0] || 'Anonymous',
        content: content.trim(),
        status: 'pending'
      };

      const { error: submitError } = await supabase
        .from('comments')
        .insert([comment]);

      if (submitError) throw submitError;

      setContent('');
      onCommentSubmitted();
    } catch (err) {
      setError('Failed to submit comment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Add a comment
        </label>
        <div className="mt-1">
          <textarea
            id="comment"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
            placeholder="Write your comment..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Comment'}
        </button>
      </div>
    </form>
  );
} 