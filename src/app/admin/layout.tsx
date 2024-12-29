import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { headers } from 'next/headers';

export const metadata = {
  title: 'Admin Dashboard - Blog',
  description: 'Admin dashboard for managing blog content and settings',
};

// Disable caching for admin routes
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function checkAdminAccess() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      redirect('/auth/sign-in?redirectTo=/admin');
    }

    if (!session?.user?.id) {
      console.log('No active session found');
      redirect('/auth/sign-in?redirectTo=/admin');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      redirect('/auth/sign-in?redirectTo=/admin');
    }

    if (profile?.role !== 'admin') {
      console.log('User is not an admin:', profile);
      redirect('/blog');
    }

    return session;
  } catch (error) {
    console.error('Unexpected error in checkAdminAccess:', error);
    redirect('/auth/sign-in?redirectTo=/admin');
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await checkAdminAccess();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        <AdminSidebar session={session} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 