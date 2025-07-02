
'use client';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import type { AppSettings } from '@/lib/types';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

const settingsSchema = z.object({
  company: z.object({
    name: z.string().min(2, 'Company name is required.'),
    address: z.string().min(5, 'Company address is required.'),
    pan: z.string().min(1, 'PAN is required.'),
    logoUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
    footerNote: z.string().optional(),
  }),
  defaults: z.object({
    vatPercent: z.coerce.number().min(0).max(100),
    tdsPercent: z.coerce.number().min(0).max(100),
  }),
});

export default function SettingsPage() {
  const { settings, updateSettings, loading } = useSettings();
  const { toast } = useToast();

  const form = useForm<AppSettings>({
    resolver: zodResolver(settingsSchema),
    values: settings, // Use `values` to make the form reactive to external changes
  });

  useEffect(() => {
    // Reset the form when the settings are loaded from storage
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const onSubmit = (data: AppSettings) => {
    updateSettings(data);
    toast({
      title: 'Settings Saved',
      description: 'Your changes have been saved successfully.',
    });
  };

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your company profile and default tax settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Company Profile</TabsTrigger>
                <TabsTrigger value="taxes">Default Taxes</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="pt-6">
                <div className="space-y-4">
                  <FormField control={form.control} name="company.name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="company.address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Address</FormLabel>
                      <FormControl><Textarea {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="company.pan" render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN / Tax ID</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="company.logoUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl><Input placeholder="https://example.com/logo.png" {...field} /></FormControl>
                         <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="company.footerNote" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Footer Note</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                       <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </TabsContent>
              <TabsContent value="taxes" className="pt-6">
                <div className="space-y-4 max-w-md">
                   <FormField control={form.control} name="defaults.vatPercent" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default VAT (%)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="defaults.tdsPercent" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default TDS (%)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                         <FormMessage />
                      </FormItem>
                    )} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
