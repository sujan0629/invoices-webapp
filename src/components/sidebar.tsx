
'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FileText,
  LayoutDashboard,
  PlusCircle,
  UserPlus,
  Users,
  Settings,
  LifeBuoy,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { COMPANY_PROFILE } from '@/lib/company';
import Image from 'next/image';
import { useAuth } from '@/context/auth';
import { Button } from './ui/button';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);
  const { role, logout } = useAuth();

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard', adminOnly: false },
    { href: '/invoices/new', icon: PlusCircle, label: 'Create Invoice', adminOnly: false },
    { href: '/invites', icon: UserPlus, label: 'Invite Officer', adminOnly: true },
    { href: '/clients', icon: Users, label: 'Clients & Projects', adminOnly: false },
    { href: '/settings', icon: Settings, label: 'Settings', adminOnly: false },
    { href: '/help', icon: LifeBuoy, label: 'Help / Support', adminOnly: false },
  ];

  return (
    <aside
      ref={sidebar}
      className={cn(
        'absolute left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden border-r bg-card duration-300 ease-linear lg:static lg:translate-x-0',
        {
          'translate-x-0': sidebarOpen,
          '-translate-x-full': !sidebarOpen,
        }
      )}
    >
      <div className="flex items-center justify-between gap-2 px-6 py-5 lg:py-6">
        <Link href="/" className="flex items-center gap-3">
          {COMPANY_PROFILE.logoUrl ? (
            <Image src={COMPANY_PROFILE.logoUrl} width={32} height={32} alt="Logo" data-ai-hint="logo" />
          ) : (
            <FileText className="h-8 w-8 text-primary" />
          )}
          <span className="text-xl font-semibold">Invoice Manager</span>
        </Link>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <X />
        </button>
      </div>
      <nav className="flex flex-col justify-between flex-1 mt-5 py-4 px-4 lg:mt-9 lg:px-6">
        <ul className="flex flex-col gap-1.5">
          {navLinks.map((link) => {
            if (link.adminOnly && role !== 'admin') {
              return null;
            }
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group relative flex items-center gap-2.5 rounded-md py-2 px-4 font-medium duration-300 ease-in-out hover:bg-secondary',
                    { 'bg-secondary text-primary': pathname === link.href }
                  )}
                >
                  <link.icon />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div>
           <Button variant="ghost" className="w-full justify-start gap-2.5 px-4" onClick={handleLogout}>
              <LogOut />
              Log Out
            </Button>
        </div>
      </nav>
    </aside>
  );
}
