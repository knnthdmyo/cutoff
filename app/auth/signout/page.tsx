'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        // Sign out from Supabase
        await signOut();
        
        // Wait a moment for cookies to clear
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Force a full page reload to /auth/login to clear all state
        window.location.href = '/auth/login';
      } catch (error) {
        console.error('Sign out error:', error);
        // Force redirect even on error
        window.location.href = '/auth/login';
      }
    };

    performSignOut();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Signing out...</p>
      </div>
    </div>
  );
}

