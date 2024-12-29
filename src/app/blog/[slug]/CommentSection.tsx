'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CommentForm } from '@/components/CommentForm';
import { CommentList } from '@/components/CommentList';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [key, setKey] = useState(0); // Used to force refresh CommentList
  const { user } = useAuth();

  const handleCommentSubmitted = () => {
    setKey(prev => prev + 1); // Force refresh the comment list
  };

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Comments
      </h2>

      {user ? (
        <div className="mb-8">
          <CommentForm
            postId={postId}
            onCommentSubmitted={handleCommentSubmitted}
          />
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Please <a href="/auth/sign-in" className="text-blue-600 hover:text-blue-500">sign in</a> to leave a comment.
        </p>
      )}

      <CommentList key={key} postId={postId} />
    </section>
  );
} 