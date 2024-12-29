'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';

export default function EditPost({ params }: { params: { slug: string } }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPost();
  }, []);

  async function fetchPost() {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        router.replace('/auth/sign-in');
        return;
      }

      const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', params.slug)
        .eq('author_id', session.user.id)
        .single();

      if (error || !post) {
        console.error('Error fetching post:', error);
        router.replace('/blog/my-posts');
        return;
      }

      setTitle(post.title);
      setContent(post.content);
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      router.replace('/blog/my-posts');
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required');
      return;
    }

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        router.replace('/auth/sign-in');
        return;
      }

      const { error } = await supabase
        .from('posts')
        .update({
          title,
          content,
          excerpt: content.split('\n')[0].slice(0, 150) + '...',
          updated_at: new Date().toISOString(),
        })
        .eq('slug', params.slug)
        .eq('author_id', session.user.id);

      if (error) throw error;

      router.push('/blog/my-posts');
      router.refresh();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    }
  }

  const handlePreviewToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreview(!isPreview);
  };

  if (isLoading) {
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
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg"
          />
        </div>

        <div className="flex justify-end space-x-2 mb-2">
          <Button
            type="button"
            variant={!isPreview ? "secondary" : "ghost"}
            onClick={handlePreviewToggle}
          >
            Write
          </Button>
          <Button
            type="button"
            variant={isPreview ? "secondary" : "ghost"}
            onClick={handlePreviewToggle}
          >
            Preview
          </Button>
        </div>

        {isPreview ? (
          <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 min-h-[300px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <Textarea
            placeholder="Write your post content in Markdown..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="font-mono"
          />
        )}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/blog/my-posts')}
          >
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
} 
