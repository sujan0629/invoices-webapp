'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is no longer in use. The AI assistant is now a persistent widget.
// We redirect users to the dashboard to avoid confusion.
export default function HelpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
