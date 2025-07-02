
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useClients } from '@/hooks/use-clients';
import { useToast } from '@/hooks/use-toast';
import type { ManagedClient } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, PlusCircle, Edit, Trash2, Mail, Home, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  address: z.string().min(5, 'Address is required.'),
});
type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: ManagedClient;
  onFormSubmit: () => void;
}

function ClientForm({ client, onFormSubmit }: ClientFormProps) {
  const { addClient, updateClient } = useClients();
  const { toast } = useToast();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ? { name: client.name, email: client.email, address: client.address } : { name: '', email: '', address: '' },
  });

  const onSubmit = (data: ClientFormData) => {
    if (client) {
      updateClient(client.id, data);
      toast({ title: 'Client Updated', description: 'The client has been successfully updated.' });
    } else {
      addClient(data);
      toast({ title: 'Client Added', description: 'The new client has been successfully added.' });
    }
    onFormSubmit();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Client Name</FormLabel>
            <FormControl><Input placeholder="e.g. Acme Inc." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Client Email</FormLabel>
            <FormControl><Input type="email" placeholder="e.g. contact@acme.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem>
            <FormLabel>Client Address</FormLabel>
            <FormControl><Textarea placeholder="e.g. 123 Business Rd, Suite 456, Commerce City" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
          <Button type="submit">{client ? 'Save Changes' : 'Add Client'}</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function ClientsPage() {
  const { clients, deleteClient, loading } = useClients();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    deleteClient(id);
    toast({ variant: 'destructive', title: 'Client Deleted' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Manage your clients and their contact information.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><PlusCircle /> Add New Client</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Client</DialogTitle>
              </DialogHeader>
              <ClientForm onFormSubmit={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}
            </div>
          ) : clients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <Card key={client.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3"><User />{client.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    <p className="flex items-start gap-3 text-sm text-muted-foreground"><Mail className="mt-1" /><span>{client.email}</span></p>
                    <p className="flex items-start gap-3 text-sm text-muted-foreground"><Home className="mt-1" /><span>{client.address}</span></p>
                  </CardContent>
                  <div className="flex items-center justify-end p-4 border-t">
                    <Dialog>
                      <DialogTrigger asChild><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Edit Client</DialogTitle></DialogHeader>
                        <ClientForm client={client} onFormSubmit={() => {
                          const closeButton = document.querySelector('[aria-label="Close"]');
                          if (closeButton instanceof HTMLElement) closeButton.click();
                        }} />
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone. This will permanently delete this client.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(client.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No clients yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add your first client to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Manage projects associated with your clients.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">This feature is coming soon.</p>
                <p className="text-sm text-muted-foreground mt-2">You will be able to add and track projects for each client here.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
