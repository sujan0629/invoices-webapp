
'use client';

import { useSettings } from '@/hooks/use-settings';
import type { Invoice, Currency } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from './ui/table';
import Watermark from './watermark';
import { Skeleton } from './ui/skeleton';

interface InvoiceTemplateProps {
  invoice: Invoice;
}

function InvoiceTemplateSkeleton() {
    return (
        <div className="bg-card text-card-foreground shadow-lg rounded-lg p-8 md:p-12 border">
            <header className="flex justify-between items-start mb-10 border-b pb-8">
                <div>
                    <Skeleton className="h-[50px] w-[150px] mb-4" />
                    <Skeleton className="h-7 w-48 mb-2" />
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-5 w-32 mt-1" />
                </div>
                <div className="text-right">
                    <Skeleton className="h-9 w-32 mb-2" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </header>
            <section className="mb-10">
                <Skeleton className="h-20 w-1/2" />
            </section>
            <section>
                <Skeleton className="h-64 w-full" />
            </section>
        </div>
    )
}


export default function InvoiceTemplate({ invoice }: InvoiceTemplateProps) {
  const { settings, loading } = useSettings();
  const companyProfile = settings.company;
  
  const formatCurrency = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };
  
  if (loading) {
    return <InvoiceTemplateSkeleton />;
  }

  return (
    <div className="bg-card text-card-foreground shadow-lg rounded-lg p-8 md:p-12 relative overflow-hidden font-mono border" id="invoice-template">
      <Watermark text={invoice.status} />
      <header className="flex justify-between items-start mb-10 border-b pb-8">
        <div>
          {companyProfile.logoUrl && (
            <Image
              src={companyProfile.logoUrl}
              alt={companyProfile.name}
              width={150}
              height={50}
              data-ai-hint="company logo"
              className="mb-4"
            />
          )}
          <h1 className="text-2xl font-bold">{companyProfile.name}</h1>
          <p className="text-muted-foreground">{companyProfile.address}</p>
          <p className="text-muted-foreground">PAN: {companyProfile.pan}</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold uppercase text-primary">Invoice</h2>
          <p className="text-muted-foreground"># {invoice.invoiceNumber}</p>
        </div>
      </header>

      <section className="mb-10">
        <div className="mb-4">
            <p className="mb-1 font-semibold">Issue Date:</p>
            <p className="text-muted-foreground">{format(new Date(invoice.issueDate), 'PPP')}</p>
        </div>
        <div className="mb-8">
            <p className="mb-1 font-semibold">Due Date:</p>
            <p className="text-muted-foreground">{format(new Date(invoice.dueDate), 'PPP')}</p>
        </div>
        <div className="text-left">
          <h3 className="font-semibold mb-2">Invoiced to:</h3>
          <p className="font-bold">{invoice.client.name}</p>
          <p className="text-muted-foreground whitespace-pre-line">{invoice.client.address}</p>
        </div>
      </section>

      <section>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[60%]">Description</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.lineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.description}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.rate, invoice.currency)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.quantity * item.rate, invoice.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
                <TableCell colSpan={3} className="text-right">Subtotal</TableCell>
                <TableCell className="text-right">{formatCurrency(invoice.subtotal, invoice.currency)}</TableCell>
            </TableRow>
            {invoice.vatAmount > 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-right">VAT ({invoice.vatPercent}%)</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.vatAmount, invoice.currency)}</TableCell>
                </TableRow>
            )}
            {invoice.tdsAmount > 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-right text-destructive">TDS ({invoice.tdsPercent}%)</TableCell>
                    <TableCell className="text-right text-destructive">-{formatCurrency(invoice.tdsAmount, invoice.currency)}</TableCell>
                </TableRow>
            )}
            <TableRow className="text-lg font-bold bg-muted/50">
                <TableCell colSpan={3} className="text-right">Total</TableCell>
                <TableCell className="text-right">{formatCurrency(invoice.total, invoice.currency)}</TableCell>
            </TableRow>
            {invoice.status === 'partial' && (
                <TableRow>
                    <TableCell colSpan={3} className="text-right">Amount Received</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.amountReceived || 0, invoice.currency)}</TableCell>
                </TableRow>
            )}
             {invoice.status === 'partial' && (
                <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold">Balance Due</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(invoice.total - (invoice.amountReceived || 0), invoice.currency)}</TableCell>
                </TableRow>
            )}
          </TableFooter>
        </Table>
      </section>

      {invoice.showTransactions && (
        <section className="mt-12">
          <h3 className="text-xl font-bold mb-4 border-t pt-6">Transactions</h3>
          {invoice.transactions && invoice.transactions.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{format(new Date(tx.date), 'PPP')}</TableCell>
                    <TableCell>{tx.gateway}</TableCell>
                    <TableCell>{tx.transactionId}</TableCell>
                    <TableCell className="text-right">{formatCurrency(tx.amount, invoice.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">No related transactions found.</p>
          )}
        </section>
      )}

      <footer className="mt-12 border-t pt-6 text-center text-muted-foreground text-sm">
        <p>{companyProfile.footerNote}</p>
      </footer>
    </div>
  );
}
