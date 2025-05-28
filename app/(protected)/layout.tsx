"use client";

import { ReactNode } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Providers } from '@/components/providers';
import { Loader2 } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      // Not authenticated, redirect to login
      router.push('/login');
    } else if (!isLoading && user) {
      // Check if user is accessing the correct role-based route
      const userRole = user.role;
      const currentPath = pathname.split('/')[1]; // e.g., "vendor", "delivery", "customer"
      
      if (userRole !== currentPath) {
        // Redirect to the correct dashboard based on role
        router.push(`/${userRole}`);
      }
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Don't render anything until redirected
  }

  return <Providers>{children}</Providers>;
}