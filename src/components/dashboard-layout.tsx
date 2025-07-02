
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './sidebar';
import Header from './header';
import { useAuth } from '@/context/auth';

const authFlowPaths = ['/login', '/verify-2fa'];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, is2faVerified } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthFlowPath = authFlowPaths.includes(pathname);

  useEffect(() => {
    if (loading) return;

    if (!user && !isAuthFlowPath) {
      router.push('/login');
    } else if (user && !is2faVerified && !isAuthFlowPath) {
      // User is logged in but hasn't passed 2FA, force them to the 2FA page.
      router.push('/verify-2fa');
    } else if (user && is2faVerified && isAuthFlowPath) {
      // Fully authenticated user is trying to access login/2fa, send to dashboard.
      router.push('/');
    }
  }, [user, loading, is2faVerified, pathname, router]);

  if (loading || (!user && !isAuthFlowPath) || (user && !is2faVerified && !isAuthFlowPath)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  // Render children without the dashboard layout for login, etc.
  if (isAuthFlowPath && (!user || !is2faVerified)) {
    return <main>{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
