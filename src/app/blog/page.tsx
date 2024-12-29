import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPosts() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  });
  
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          username,
          avatar_url
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;

    return {
      posts: posts || [],
      session
    };
  } catch (error) {
    console.error('Error in getPosts:', error);
    return {
      posts: [],
      session: null
    };
  }
}

export default async function BlogPage() {
  const { posts } = await getPosts();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts yet.</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="border-b pb-8">
              <div className="flex items-center mb-2">
                <img
                  src={post.profiles?.avatar_url || '/images/default-avatar.svg'}
                  alt={post.profiles?.username || 'Anonymous'}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium">{post.profiles?.username || 'Anonymous'}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-xl font-semibold mb-2 hover:text-blue-600">
                  {post.title}
                </h2>
              </Link>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex items-center text-gray-500 text-sm">
                <button className="flex items-center mr-4">
                  <span className="mr-1">♥</span>
                  <span>0</span>
                </button>
                <button className="flex items-center mr-4">
                  <span className="mr-1">💬</span>
                  <span>0</span>
                </button>
                <button className="flex items-center">
                  <span className="mr-1">🔖</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
} 