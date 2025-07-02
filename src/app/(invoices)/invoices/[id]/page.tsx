
'use client';

import { useParams } from 'next/navigation';
import InvoiceForm from '@/components/invoice-form';
import { useInvoices } from '@/hooks/use-invoices';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function EditInvoicePage() {
  const params = useParams();
  const { id } = params;
  const { getInvoice, loading } = useInvoices();
  const invoice = getInvoice(id as string);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-10">
        <p>Invoice not found.</p>
      </div>
    );
  }

  return <InvoiceForm invoice={invoice} />;
}
