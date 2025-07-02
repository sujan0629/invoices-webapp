
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
import { useAuth } from '@/context/auth';
import { useToast } from '@/hooks/use-toast';
import { FileText, User, UserCog } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL!;

const adminLoginSchema = z.object({
  password: z.string().min(1, 'Password is required.'),
});
type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

const officerLoginSchema = z.object({
    email: z.string().email('Invalid email address.'),
    password: z.string().min(1, 'Password is required.'),
});
type OfficerLoginFormValues = z.infer<typeof officerLoginSchema>;


export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const adminForm = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { password: '' },
  });

  const officerForm = useForm<OfficerLoginFormValues>({
      resolver: zodResolver(officerLoginSchema),
      defaultValues: { email: '', password: '' },
  });

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await login(email, password);
      const user = userCredential.user;

      if (user) {
        const role = user.email === ADMIN_EMAIL ? 'admin' : 'user';
        sessionStorage.setItem('auth-session', JSON.stringify({ role, email: user.email }));

        toast({ title: 'Success', description: 'Redirecting for verification...' });
        router.push('/verify-2fa');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onAdminSubmit = (data: AdminLoginFormValues) => {
    handleLogin(ADMIN_EMAIL, data.password);
  };

  const onOfficerSubmit = (data: OfficerLoginFormValues) => {
      handleLogin(data.email, data.password);
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
            <FileText className="mx-auto h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Codelits Studio Invoice Manager</h1>
            <p className="text-sm text-muted-foreground">Select your role to sign in</p>
        </div>
        <Tabs defaultValue="officer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="officer"><User className="mr-2 h-4 w-4" />Financial Officer</TabsTrigger>
                <TabsTrigger value="admin"><UserCog className="mr-2 h-4 w-4" />Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="officer">
                <Card>
                    <CardContent className="p-6">
                        <Form {...officerForm}>
                        <form onSubmit={officerForm.handleSubmit(onOfficerSubmit)} className="space-y-4">
                            <FormField
                            control={officerForm.control}
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
                            control={officerForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="admin">
                 <Card>
                    <CardContent className="p-6">
                        <Form {...adminForm}>
                        <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-4">
                             <FormItem>
                                <FormLabel>Admin Email</FormLabel>
                                <Input value={ADMIN_EMAIL} disabled />
                            </FormItem>
                            <FormField
                            control={adminForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Signing In...' : 'Sign In as Admin'}
                            </Button>
                        </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Financial officers can only log in after receiving an invitation from an administrator.
        </p>
      </div>
    </div>
  );
}
