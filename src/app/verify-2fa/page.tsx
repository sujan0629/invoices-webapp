
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { useRouter } from 'next/navigation';
import { send2faCode } from '@/ai/flows/send-2fa-email';

const verifySchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 characters.'),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function Verify2FAPage() {
  const { toast } = useToast();
  const { complete2faVerification, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [role, setRole] = useState('');

  const handleSendCode = useCallback(async () => {
    setIsSendingCode(true);
    toast({ title: 'Sending Code', description: 'A verification code is being sent...' });

    const sessionData = sessionStorage.getItem('auth-session');
    if (!sessionData) {
      logout();
      return;
    }

    const { role, email } = JSON.parse(sessionData);
    setRole(role);
    const targetEmail = role === 'admin' ? process.env.NEXT_PUBLIC_ADMIN_2FA_EMAIL! : email;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);

    const result = await send2faCode({ email: targetEmail, code });
    if (result.success) {
      toast({ title: 'Code Sent', description: 'Please check your email for the code.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send verification code. Please try again.' });
    }
    setIsSendingCode(false);
  }, [logout, toast]);

  useEffect(() => {
    handleSendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' },
  });

  const onSubmit = async (data: VerifyFormValues) => {
    setIsLoading(true);
    if (data.code === verificationCode) {
      complete2faVerification();
      sessionStorage.removeItem('auth-session');
      toast({ title: 'Success', description: 'Verification successful!' });
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'The code you entered is incorrect.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Two-Factor Authentication</h1>
            <p className="text-sm text-muted-foreground">
                {role === 'admin' 
                    ? 'Enter the 6-digit code sent to the registered admin email address.'
                    : 'Enter the 6-digit code sent to your email address.'
                }
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
                    <Button type="submit" className="w-full" disabled={isLoading || isSendingCode}>
                    {isLoading ? 'Verifying...' : 'Verify'}
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
        <div className="flex justify-between items-center text-sm">
            <Button variant="link" onClick={() => logout()} className="p-0 h-auto">
                Back to login
            </Button>
            <Button variant="link" onClick={handleSendCode} disabled={isSendingCode} className="p-0 h-auto">
                {isSendingCode ? 'Sending...' : 'Resend code'}
            </Button>
        </div>
      </div>
    </div>
  );
}
