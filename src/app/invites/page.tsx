'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useInvitations } from '@/hooks/use-invitations';
import { sendInviteEmail } from '@/ai/flows/send-invite-email';
import { Mail } from 'lucide-react';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export default function InvitePage() {
  const { toast } = useToast();
  const { addInvitation } = useInvitations();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: InviteFormValues) => {
    setIsLoading(true);
    toast({ title: 'Sending Invitation...' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      addInvitation({ email: data.email, code });

      const result = await sendInviteEmail({ email: data.email, code });
      
      if (result.success) {
        toast({
          title: 'Invitation Sent!',
          description: `An invitation has been sent to ${data.email}.`,
        });
        form.reset();
      } else {
        throw new Error('Failed to send email.');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not send invitation. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Invite Financial Officer</CardTitle>
        <CardDescription>
          Send an invitation to a new financial officer. They will receive an
          email with a one-time code to create their account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Officer's Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="name@example.com" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
