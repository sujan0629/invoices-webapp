
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, PlusCircle } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
    return (
        <header className="sticky top-0 z-40 flex w-full bg-card border-b">
            <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-8">
                <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                    <button
                        aria-controls="sidebar"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSidebarOpen(!sidebarOpen);
                        }}
                        className="z-50 block rounded-sm border bg-card p-1.5 lg:hidden"
                    >
                        <Menu className="h-5 w-5"/>
                    </button>
                </div>

                <div className="hidden sm:block">
                    {/* Placeholder for future elements like search */}
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/invoices/new">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Invoice
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
