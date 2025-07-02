
import { Badge } from '@/components/ui/badge';
import type { InvoiceStatus } from '@/lib/types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export default function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const statusStyles: Record<InvoiceStatus, { text: string; className: string }> = {
    paid: { text: 'Paid', className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100' },
    unpaid: { text: 'Unpaid', className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100' },
    partial: { text: 'Partial', className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100' },
  };

  const { text, className } = statusStyles[status];

  return (
    <Badge variant="outline" className={className}>
      {text}
    </Badge>
  );
}
