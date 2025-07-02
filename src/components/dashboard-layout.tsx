'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './sidebar';
import Header from './header';
import { useAuth } from '@/context/auth';

const authFlowPaths = ['/login', '/verify-2fa', '/complete-invitation'];
const adminOnlyPaths = ['/invites'];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, is2faVerified, role } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthFlowPath = authFlowPaths.includes(pathname);

  useEffect(() => {
    if (loading) return;

    if (!user && !isAuthFlowPath) {
      router.push('/login');
    } else if (user && !is2faVerified && !isAuthFlowPath) {
      router.push('/verify-2fa');
    } else if (user && is2faVerified && isAuthFlowPath) {
      router.push('/');
    } else if (user && is2faVerified && role === 'user' && adminOnlyPaths.includes(pathname)) {
        router.push('/');
    }
  }, [user, loading, is2faVerified, pathname, router, role]);

  if (loading || (!user && !isAuthFlowPath) || (user && !is2faVerified && !isAuthFlowPath)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

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
