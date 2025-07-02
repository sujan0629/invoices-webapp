
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { send2faCode } from '@/ai/flows/send-2fa-email';

const verifySchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 characters.'),
});
type VerifyFormValues = z.infer<typeof verifySchema>;

const TS_KEY = '2fa-last-sent-ts';
const THROTTLE_MS = 30_000; // 30 seconds

export default function Verify2FAPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, complete2faVerification, logout } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [role, setRole] = useState('');

  const handleSendCode = useCallback(async () => {
    const lastTs = parseInt(sessionStorage.getItem(TS_KEY) || '0', 10);
    if (Date.now() - lastTs < THROTTLE_MS) {
      return;
    }
    sessionStorage.setItem(TS_KEY, Date.now().toString());

    const sessionData = sessionStorage.getItem('auth-session');
    if (!sessionData) {
      toast({
        variant: 'destructive',
        title: 'Session Error',
        description: 'Your session could not be found. Please log in again.',
      });
      logout();
      return;
    }

    setIsSending(true);
    toast({ title: 'Sending Code', description: 'A verification code is on its way...' });

    const { role, email } = JSON.parse(sessionData);
    setRole(role);
    const targetEmail =
      role === 'admin'
        ? process.env.NEXT_PUBLIC_ADMIN_2FA_EMAIL!
        : email;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);

    try {
      const result = await send2faCode({ email: targetEmail, code });
      if (!result.success) throw new Error('Failed to send');
      toast({ title: 'Code Sent', description: 'Please check your email.' });
    } catch {
      sessionStorage.removeItem(TS_KEY);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send code. Please try again.',
      });
    } finally {
      setIsSending(false);
    }
  }, [logout, toast]);

  useEffect(() => {
    if (user) {
      handleSendCode();
    }
  }, [user, handleSendCode]);

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' },
  });

  const onSubmit = async (data: VerifyFormValues) => {
    setIsLoading(true);
    if (data.code === verificationCode) {
      complete2faVerification();
      sessionStorage.removeItem(TS_KEY);
      toast({ title: 'Success', description: 'Verification successful!' });
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'The code is incorrect. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <ShieldCheck className="mx-auto h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold">Two-Factor Authentication</h1>
          <p className="text-sm text-muted-foreground">
            {role === 'admin'
              ? 'Enter the code sent to the admin email.'
              : 'Enter the code sent to your email.'}
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading || isSending}>
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="flex justify-between text-sm">
          <Button variant="link" onClick={handleLogout} className="p-0 h-auto">
            Back to login
          </Button>
          <Button variant="link" onClick={handleSendCode} disabled={isSending} className="p-0 h-auto">
            {isSending ? 'Sending...' : 'Resend code'}
          </Button>
        </div>
      </div>
    </div>
  );
}
