
import { COMPANY_PROFILE } from '@/lib/company';
import type { Invoice } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from './ui/table';

interface InvoiceTemplateProps {
  invoice: Invoice;
}

const Watermark = ({ text }: { text: string }) => {
    let colorClass = '';
    switch(text.toUpperCase()){
        case 'PAID': colorClass = 'text-green-500/20'; break;
        case 'PARTIAL': colorClass = 'text-yellow-500/20'; break;
        case 'UNPAID': colorClass = 'text-red-500/20'; break;
    }

  return (
    <div className={`absolute inset-0 flex items-center justify-center -z-10`}>
      <p className={`text-9xl font-bold uppercase transform -rotate-45 ${colorClass} select-none`}>
        {text}
      </p>
    </div>
  );
};

export default function InvoiceTemplate({ invoice }: InvoiceTemplateProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  return (
    <div className="bg-card text-card-foreground shadow-lg rounded-lg p-8 md:p-12 relative overflow-hidden font-mono" id="invoice-template">
      <Watermark text={invoice.status} />
      <header className="flex justify-between items-start mb-10 border-b pb-8">
        <div>
          {COMPANY_PROFILE.logoUrl && (
            <Image
              src={COMPANY_PROFILE.logoUrl}
              alt={COMPANY_PROFILE.name}
              width={150}
              height={50}
              data-ai-hint="company logo"
              className="mb-4"
            />
          )}
          <h1 className="text-2xl font-bold">{COMPANY_PROFILE.name}</h1>
          <p className="text-muted-foreground">{COMPANY_PROFILE.address}</p>
          <p className="text-muted-foreground">PAN: {COMPANY_PROFILE.pan}</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold uppercase text-primary">Invoice</h2>
          <p className="text-muted-foreground"># {invoice.invoiceNumber}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 mb-10">
        <div className="text-left">
          <p><span className="font-semibold">Issue Date:</span> {format(new Date(invoice.issueDate), 'PPP')}</p>
          <p><span className="font-semibold">Due Date:</span> {format(new Date(invoice.dueDate), 'PPP')}</p>
        </div>
        <div className="text-right">
          <h3 className="font-semibold mb-2">Invoiced to:</h3>
          <p className="font-bold">{invoice.client.name}</p>
          <p className="text-muted-foreground">{invoice.client.address}</p>
        </div>
      </section>

      <section>
        <Table>
          <TableHeader>
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
                <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.quantity * item.rate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
                <TableCell colSpan={3} className="text-right">Subtotal</TableCell>
                <TableCell className="text-right">{formatCurrency(invoice.subtotal)}</TableCell>
            </TableRow>
            {invoice.vatAmount > 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-right">VAT ({invoice.vatPercent}%)</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.vatAmount)}</TableCell>
                </TableRow>
            )}
            {invoice.tdsAmount > 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-right text-destructive">TDS ({invoice.tdsPercent}%)</TableCell>
                    <TableCell className="text-right text-destructive">-{formatCurrency(invoice.tdsAmount)}</TableCell>
                </TableRow>
            )}
            <TableRow className="text-lg font-bold bg-muted/50">
                <TableCell colSpan={3} className="text-right">Total</TableCell>
                <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
            </TableRow>
            {invoice.status === 'partial' && (
                <TableRow>
                    <TableCell colSpan={3} className="text-right">Amount Received</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.amountReceived || 0)}</TableCell>
                </TableRow>
            )}
             {invoice.status === 'partial' && (
                <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold">Balance Due</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(invoice.total - (invoice.amountReceived || 0))}</TableCell>
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
              <TableHeader>
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
                    <TableCell className="text-right">{formatCurrency(tx.amount)}</TableCell>
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
        <p>{COMPANY_PROFILE.footerNote}</p>
      </footer>
    </div>
  );
}
