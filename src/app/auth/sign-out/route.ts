import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });

    // Sign out on the server
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Create response with redirect
    const response = NextResponse.redirect(new URL('/auth/sign-in', request.url), {
      status: 302,
    });

    // Clear auth cookie
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');

    return response;
  } catch (error) {
    console.error('Error in sign-out:', error);
    return NextResponse.redirect(new URL('/auth/sign-in', request.url), {
      status: 302,
    });
  }
} 