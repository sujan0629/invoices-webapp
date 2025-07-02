'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';
import { useInvitations } from '@/hooks/use-invitations';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';

const completeInvitationSchema = z.object({
  email: z.string().email('Invalid email address.'),
  code: z.string().length(6, 'Invitation code must be 6 digits.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type CompleteInvitationFormValues = z.infer<typeof completeInvitationSchema>;

export default function CompleteInvitationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createUser } = useAuth();
  const { verifyInvitation, acceptInvitation } = useInvitations();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CompleteInvitationFormValues>({
    resolver: zodResolver(completeInvitationSchema),
    defaultValues: { email: '', code: '', password: '' },
  });

  const onSubmit = async (data: CompleteInvitationFormValues) => {
    setIsLoading(true);
    
    const isVerified = verifyInvitation(data.email, data.code);
    if (!isVerified) {
      toast({
        variant: 'destructive',
        title: 'Invalid Invitation',
        description: 'The email or code is incorrect. Please check and try again.',
      });
      setIsLoading(false);
      return;
    }

    try {
      await createUser(data.email, data.password);
      
      acceptInvitation(data.email);

      toast({
        title: 'Account Created!',
        description: 'You can now log in with your new credentials.',
      });
      router.push('/login');

    } catch (error: any) {
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email address is already in use. Please log in instead.';
      }
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
            <UserPlus className="mx-auto h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Accept Your Invitation</h1>
            <p className="text-sm text-muted-foreground">Enter your email, invitation code, and set a password.</p>
        </div>
        <Card>
            <CardContent className="p-6">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Invitation Code</FormLabel>
                        <FormControl>
                            <Input placeholder="123456" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
