'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    try {
      // Sign out on the client
      const supabase = createClientComponentClient();
      await supabase.auth.signOut();

      // Call server-side sign-out
      await fetch('/auth/sign-out', { method: 'POST' });

      // Force a hard refresh to clear all state
      window.location.href = '/auth/sign-in';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <Button 
      variant="ghost" 
      onClick={handleSignOut}
    >
      Sign out
    </Button>
  );
} 