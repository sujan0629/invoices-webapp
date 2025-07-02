
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import DashboardLayout from '@/components/dashboard-layout';
import { AuthProvider } from '@/context/auth';
import { ChatWidgetProvider } from '@/context/chat-widget';

export const metadata: Metadata = {
  title: 'Codelits Studio Invoice Manager',
  description: 'Manage your invoices with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <ChatWidgetProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </ChatWidgetProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
