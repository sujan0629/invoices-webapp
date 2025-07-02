
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Trash2, Sparkles } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useInvoices } from '@/hooks/use-invoices';
import { useSettings } from '@/hooks/use-settings';
import type { Invoice, LineItem, Transaction, Currency } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import AiDescriptionSuggester from './ai-description-suggester';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { categorizeLineItem } from '@/ai/flows/categorize-line-item';

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required.'),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive.'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
  category: z.string().optional(),
});

const transactionSchema = z.object({
  id: z.string(),
  date: z.date(),
  gateway: z.string().min(1, 'Gateway is required.'),
  transactionId: z.string().min(1, 'Transaction ID is required.'),
  amount: z.coerce.number().min(0.01, 'Amount must be positive.'),
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required.'),
  issueDate: z.date(),
  dueDate: z.date(),
  currency: z.enum(['USD', 'INR', 'NPR']),
  client: z.object({
    name: z.string().min(1, 'Client name is required.'),
    address: z.string().min(1, 'Client address is required.'),
  }),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required.'),
  status: z.enum(['paid', 'unpaid', 'partial']),
  vatPercent: z.coerce.number().min(0).max(100),
  tdsPercent: z.coerce.number().min(0).max(100),
  amountReceived: z.coerce.number().optional(),
  showTransactions: z.boolean(),
  transactions: z.array(transactionSchema).optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  invoice?: Invoice;
}

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  INR: '₹',
  NPR: 'Rs',
};

export default function InvoiceForm({ invoice }: InvoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addInvoice, updateInvoice, getPreviousLineItems } = useInvoices();
  const { settings } = useSettings();
  const [isCategorizing, setIsCategorizing] = useState<Record<number, boolean>>({});

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice
      ? {
          ...invoice,
          issueDate: parseISO(invoice.issueDate),
          dueDate: parseISO(invoice.dueDate),
          transactions: invoice.transactions?.map(tx => ({...tx, date: parseISO(tx.date)})) || [],
        }
      : {
          invoiceNumber: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
          issueDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          currency: 'USD',
          client: { name: '', address: '' },
          lineItems: [{ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, category: '' }],
          status: 'unpaid',
          vatPercent: settings.defaults.vatPercent,
          tdsPercent: settings.defaults.tdsPercent,
          amountReceived: 0,
          showTransactions: false,
          transactions: [],
        },
  });

  useEffect(() => {
    // When settings load, if it's a new invoice, update the defaults
    if (!invoice) {
        form.setValue('vatPercent', settings.defaults.vatPercent);
        form.setValue('tdsPercent', settings.defaults.tdsPercent);
    }
  }, [settings, form, invoice]);

  const { fields: lineItemFields, append: appendLineItem, remove: removeLineItem } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });
  
  const { fields: transactionFields, append: appendTransaction, remove: removeTransaction } = useFieldArray({
      control: form.control,
      name: 'transactions',
  });

  const watchedLineItems = form.watch('lineItems');
  const watchedVatPercent = form.watch('vatPercent');
  const watchedTdsPercent = form.watch('tdsPercent');
  const watchedCurrency = form.watch('currency');

  const currencySymbol = currencySymbols[watchedCurrency];
  
  const handleAutoCategory = async (index: number) => {
    const description = form.getValues(`lineItems.${index}.description`);
    if (!description) return;

    setIsCategorizing(prev => ({...prev, [index]: true}));
    try {
      const result = await categorizeLineItem({ description });
      if (result.category) {
        form.setValue(`lineItems.${index}.category`, result.category);
      }
    } catch (error) {
      console.error("Failed to get category suggestion:", error);
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not fetch category suggestion.' });
    } finally {
      setIsCategorizing(prev => ({...prev, [index]: false}));
    }
  };

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
      transactions: data.transactions?.map(tx => ({...tx, date: tx.date.toISOString()})),
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                        <SelectItem value="INR">INR - Indian Rupee (₹)</SelectItem>
                        <SelectItem value="NPR">NPR - Nepalese Rupee (Rs)</SelectItem>
                      </SelectContent>
                    </Select>
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
              {lineItemFields.map((field, index) => (
                <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start p-2 border-b">
                  <div className='flex-grow space-y-2'>
                    <FormField
                      control={form.control}
                      name={`lineItems.${index}.description`}
                      render={({ field: descField }) => (
                        <FormItem>
                          <FormLabel className={cn(index !== 0 && "sr-only")}>Description</FormLabel>
                          <FormControl>
                            <AiDescriptionSuggester
                              {...descField}
                              previousEntries={getPreviousLineItems()}
                              onBlur={() => {
                                descField.onBlur();
                                handleAutoCategory(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name={`lineItems.${index}.category`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Category</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Sparkles className={cn(
                                        "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                                        isCategorizing[index] && "animate-spin text-primary"
                                    )} />
                                    <Input placeholder="AI will suggest a category..." className="pl-9 text-xs h-8" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
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
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{currencySymbol}</span>
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
                      {currencySymbol}{(watchedLineItems[index].quantity * watchedLineItems[index].rate).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-0 md:mt-6 text-destructive hover:bg-destructive/10"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItemFields.length <= 1}
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
              onClick={() => appendLineItem({ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, category: '' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Line Item
            </Button>
          </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>Add any payment transactions related to this invoice.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="showTransactions"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-6">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Show Transactions on Invoice
                                </FormLabel>
                                <FormDescription>
                                    If enabled, a list of transactions will be displayed on the invoice.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {form.watch('showTransactions') && (
                    <div className="space-y-4">
                        {transactionFields.map((field, index) => (
                            <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start p-2 border rounded-md relative">
                                <div className="grid md:grid-cols-4 gap-4 flex-grow">
                                <FormField
                                    control={form.control}
                                    name={`transactions.${index}.date`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={cn(index !== 0 && "sr-only")}>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={'outline'} className={cn('w-full text-left font-normal', !field.value && 'text-muted-foreground')}>
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
                                    name={`transactions.${index}.gateway`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={cn(index !== 0 && "sr-only")}>Gateway</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Stripe, PayPal" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`transactions.${index}.transactionId`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={cn(index !== 0 && "sr-only")}>Transaction ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. ch_123abc..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`transactions.${index}.amount`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={cn(index !== 0 && "sr-only")}>Amount</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{currencySymbol}</span>
                                                <Input type="number" step="0.01" className="pl-7" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="mt-0 md:mt-6 text-destructive hover:bg-destructive/10"
                                    onClick={() => removeTransaction(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                         <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => appendTransaction({ id: crypto.randomUUID(), date: new Date(), gateway: '', transactionId: '', amount: 0 })}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
                        </Button>
                    </div>
                )}
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
                <span className="font-medium">{currencySymbol}{subtotal.toFixed(2)}</span>
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
                                onCheckedChange={(checked) => field.onChange(checked ? settings.defaults.vatPercent : 0)}
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
                <span className="font-medium">{currencySymbol}{vatAmount.toFixed(2)}</span>
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
                                onCheckedChange={(checked) => field.onChange(checked ? settings.defaults.tdsPercent : 0)}
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
                <span className="font-medium text-destructive">-{currencySymbol}{tdsAmount.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex items-center justify-between text-xl font-bold">
                <span>Total</span>
                <span>{currencySymbol}{total.toFixed(2)}</span>
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
