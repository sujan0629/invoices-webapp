
export type InvoiceStatus = 'paid' | 'unpaid' | 'partial';

export interface Company {
  name: string;
  logoUrl?: string;
  address: string;
  pan: string;
  footerNote: string;
}

export interface Client {
  name: string;
  address: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  client: Client;
  lineItems: LineItem[];
  status: InvoiceStatus;
  vatPercent: number;
  tdsPercent: number;
  subtotal: number;
  vatAmount: number;
  tdsAmount: number;
  total: number;
  amountReceived?: number;
}
