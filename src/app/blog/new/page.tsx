'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import type { MDEditorProps } from '@uiw/react-md-editor';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false }) as any;

export default function NewPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.replace('/auth/sign-in');
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auth:', error);
      router.replace('/auth/sign-in');
    }
  }

  async function handlePublish() {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        router.replace('/auth/sign-in');
        return;
      }

      if (!title.trim() || !content.trim()) {
        alert('Please fill in both title and content');
        return;
      }

      const slug = title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-');

      const { error: postError } = await supabase.from('posts').insert({
        title,
        content,
        slug,
        author_id: session.user.id,
        published: true,
        excerpt: content.slice(0, 200) + (content.length > 200 ? '...' : '')
      });

      if (postError) throw postError;

      router.push('/blog');
      router.refresh();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>

      <div className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            className="text-lg"
          />
        </div>

        <div className="flex justify-end space-x-2 mb-2">
          <Button
            variant={!isPreview ? "secondary" : "ghost"}
            onClick={() => setIsPreview(false)}
          >
            Write
          </Button>
          <Button
            variant={isPreview ? "secondary" : "ghost"}
            onClick={() => setIsPreview(true)}
          >
            Preview
          </Button>
        </div>

        {isPreview ? (
          <div className="prose max-w-none">
            {MDEditor?.Markdown && <MDEditor.Markdown source={content} />}
          </div>
        ) : (
          <Textarea
            placeholder="Write your post content in Markdown..."
            value={content}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            rows={15}
            className="font-mono"
          />
        )}

        <div className="flex justify-end">
          <Button onClick={handlePublish}>
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
} 