'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Comment } from '@/types/database';

interface CommentListProps {
  postId: string;
  showModeration?: boolean;
}

export function CommentList({ postId, showModeration = false }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const query = supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      // If not in moderation mode, only show approved comments
      if (!showModeration) {
        query.eq('status', 'approved');
      }

      const { data } = await query;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (commentId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status })
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.map(comment =>
        comment.id === commentId ? { ...comment, status } : comment
      ));
    } catch (error) {
      console.error('Error moderating comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600 dark:text-gray-400">Loading comments...</p>;
  }

  if (comments.length === 0) {
    return (
      <p className="text-center text-gray-600 dark:text-gray-400">
        {showModeration ? 'No comments to moderate.' : 'No comments yet.'}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {comment.author_name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(comment.created_at), 'MMMM d, yyyy h:mm a')}
              </p>
            </div>
            {showModeration && (
              <div className="flex items-center space-x-2">
                {comment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleModerate(comment.id, 'approved')}
                      className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleModerate(comment.id, 'rejected')}
                      className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
          </div>
          {showModeration && (
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                comment.status === 'approved'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : comment.status === 'rejected'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
              </span>
              {comment.spam_score > 0.5 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Potential Spam
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 