import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Post, Profile } from '@/types/database';
import { CommentSection } from './CommentSection';

async function getBlogPost(slug: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(username, full_name)
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  return post as (Post & { author: Profile }) | null;
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Ensure we have a valid session
  const { data: { session } } = await supabase.auth.getSession();
  
  const post = await getBlogPost(await params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <article className="mb-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>By {post.author.full_name || post.author.username}</span>
            <span className="mx-2">•</span>
            <time dateTime={post.created_at}>
              {format(new Date(post.created_at), 'MMMM d, yyyy')}
            </time>
          </div>
        </header>

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
        )}

        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>

      <hr className="border-t border-gray-200 dark:border-gray-700 mb-12" />

      <CommentSection postId={post.id} />
    </div>
  );
} 