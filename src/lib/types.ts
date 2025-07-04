export type InvoiceStatus = 'paid' | 'unpaid' | 'partial';
export type Currency = 'USD' | 'INR' | 'NPR';

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

export interface ManagedClient {
  id: string;
  name: string;
  email: string;
  address: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  category?: string;
}

export interface Transaction {
  id:string;
  date: string;
  gateway: string;
  transactionId: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  client: Client;
  lineItems: LineItem[];
  status: InvoiceStatus;
  currency: Currency;
  vatPercent: number;
  tdsPercent: number;
  subtotal: number;
  vatAmount: number;
  tdsAmount: number;
  total: number;
  amountReceived?: number;
  showTransactions: boolean;
  transactions?: Transaction[];
}

export interface Invitation {
  email: string;
  code: string;
  status: 'pending' | 'accepted';
}

export interface AppSettings {
    company: Company;
    defaults: {
        vatPercent: number;
        tdsPercent: number;
    }
}
