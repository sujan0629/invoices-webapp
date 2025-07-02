
'use client';

import { useParams } from 'next/navigation';
import { useInvoices } from '@/hooks/use-invoices';
import InvoiceTemplate from '@/components/invoice-template';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function ViewInvoicePage() {
  const params = useParams();
  const { id } = params;
  const { getInvoice, loading } = useInvoices();
  const invoice = getInvoice(id as string);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!invoice) {
    return <div>Invoice not found.</div>;
  }

  return (
    <div className="bg-background min-h-screen">
       <div className="container mx-auto py-8">
         <div className="flex justify-end mb-4 print:hidden">
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print / Download PDF
            </Button>
         </div>
         <InvoiceTemplate invoice={invoice} />
       </div>
    </div>
  );
}
