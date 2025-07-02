
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useInvoices } from '@/hooks/use-invoices';
import type { Invoice, LineItem } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import AiDescriptionSuggester from './ai-description-suggester';

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required.'),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive.'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required.'),
  issueDate: z.date(),
  dueDate: z.date(),
  client: z.object({
    name: z.string().min(1, 'Client name is required.'),
    address: z.string().min(1, 'Client address is required.'),
  }),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required.'),
  status: z.enum(['paid', 'unpaid', 'partial']),
  vatPercent: z.coerce.number().min(0).max(100),
  tdsPercent: z.coerce.number().min(0).max(100),
  amountReceived: z.coerce.number().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  invoice?: Invoice;
}

export default function InvoiceForm({ invoice }: InvoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addInvoice, updateInvoice, getPreviousLineItems } = useInvoices();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice
      ? {
          ...invoice,
          issueDate: parseISO(invoice.issueDate),
          dueDate: parseISO(invoice.dueDate),
        }
      : {
          invoiceNumber: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
          issueDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          client: { name: '', address: '' },
          lineItems: [{ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }],
          status: 'unpaid',
          vatPercent: 0,
          tdsPercent: 0,
          amountReceived: 0,
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  const watchedLineItems = form.watch('lineItems');
  const watchedVatPercent = form.watch('vatPercent');
  const watchedTdsPercent = form.watch('tdsPercent');

  const calculateTotals = () => {
    const subtotal = watchedLineItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.rate || 0), 0);
    const vatAmount = subtotal * (watchedVatPercent / 100);
    const tdsAmount = subtotal * (watchedTdsPercent / 100);
    const total = subtotal + vatAmount - tdsAmount;
    return { subtotal, vatAmount, tdsAmount, total };
  };

  const { subtotal, vatAmount, tdsAmount, total } = calculateTotals();

  const onSubmit = (data: InvoiceFormData) => {
    const invoiceData: Omit<Invoice, 'id'> = {
      ...data,
      issueDate: data.issueDate.toISOString(),
      dueDate: data.dueDate.toISOString(),
      subtotal,
      vatAmount,
      tdsAmount,
      total,
    };

    if (invoice) {
      updateInvoice(invoice.id, invoiceData);
      toast({ title: 'Invoice Updated', description: 'The invoice has been successfully updated.' });
    } else {
      addInvoice(invoiceData as Invoice);
      toast({ title: 'Invoice Created', description: 'The new invoice has been successfully created.' });
    }
    router.push('/');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{invoice ? 'Edit Invoice' : 'New Invoice'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="client.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="client.address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Client Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g. 123 Main St, Anytown, USA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn('w-full text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                     <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn('w-full text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start">
                  <FormField
                    control={form.control}
                    name={`lineItems.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormLabel className={cn(index !== 0 && "sr-only")}>Description</FormLabel>
                        <FormControl>
                          <AiDescriptionSuggester
                            {...field}
                            previousEntries={getPreviousLineItems()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`lineItems.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-full md:w-24">
                        <FormLabel className={cn(index !== 0 && "sr-only")}>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`lineItems.${index}.rate`}
                    render={({ field }) => (
                      <FormItem className="w-full md:w-32">
                        <FormLabel className={cn(index !== 0 && "sr-only")}>Rate</FormLabel>
                        <FormControl>
                           <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                            <Input type="number" step="0.01" className="pl-7" {...field} />
                           </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="w-full md:w-32 text-right">
                    <FormLabel className={cn(index !== 0 && "sr-only")}>Amount</FormLabel>
                    <p className="font-medium h-10 flex items-center justify-end">
                      ${(watchedLineItems[index].quantity * watchedLineItems[index].rate).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-0 md:mt-6 text-destructive hover:bg-destructive/10"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => append({ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Line Item
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Invoice Status</FormLabel>
                            <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-4"
                            >
                                <FormItem className="flex items-center space-x-2">
                                <FormControl><RadioGroupItem value="unpaid" /></FormControl>
                                <FormLabel className="font-normal">Unpaid</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2">
                                <FormControl><RadioGroupItem value="paid" /></FormControl>
                                <FormLabel className="font-normal">Paid</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2">
                                <FormControl><RadioGroupItem value="partial" /></FormControl>
                                <FormLabel className="font-normal">Partial</FormLabel>
                                </FormItem>
                            </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    {form.watch('status') === 'partial' && (
                        <FormField
                            control={form.control}
                            name="amountReceived"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount Received</FormLabel>
                                <FormControl>
                                <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}
                </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="vatPercent"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                         <FormControl>
                            <Switch 
                                id="vat-switch" 
                                checked={field.value > 0}
                                onCheckedChange={(checked) => field.onChange(checked ? 13 : 0)}
                            />
                        </FormControl>
                        <FormLabel htmlFor="vat-switch">VAT</FormLabel>
                      </FormItem>
                    )}
                  />
                  {form.watch('vatPercent') > 0 && (
                     <FormField
                        control={form.control}
                        name="vatPercent"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                               <div className="relative">
                                <Input type="number" className="w-20 h-8 text-sm" {...field} />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">%</span>
                               </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  )}
                </div>
                <span className="font-medium">${vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="tdsPercent"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                         <FormControl>
                            <Switch 
                                id="tds-switch" 
                                checked={field.value > 0}
                                onCheckedChange={(checked) => field.onChange(checked ? 1.5 : 0)}
                            />
                        </FormControl>
                        <FormLabel htmlFor="tds-switch">TDS</FormLabel>
                      </FormItem>
                    )}
                  />
                  {form.watch('tdsPercent') > 0 && (
                     <FormField
                        control={form.control}
                        name="tdsPercent"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                               <div className="relative">
                                <Input type="number" className="w-20 h-8 text-sm" {...field} />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">%</span>
                               </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  )}
                </div>
                <span className="font-medium text-destructive">-${tdsAmount.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex items-center justify-between text-xl font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            {invoice ? 'Save Changes' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
