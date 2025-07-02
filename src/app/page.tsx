
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useInvoices } from '@/hooks/use-invoices';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import InvoiceStatusBadge from '@/components/invoice-status-badge';
import InvoiceActions from '@/components/invoice-actions';
import { format } from 'date-fns';
import type { Currency, Invoice } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, FileText, AlertTriangle } from 'lucide-react';

const reportsData = [
  { name: 'Jan', revenue: 4000, expenses: 2400 },
  { name: 'Feb', revenue: 3000, expenses: 1398 },
  { name: 'Mar', revenue: 5000, expenses: 9800 },
  { name: 'Apr', revenue: 2780, expenses: 3908 },
  { name: 'May', revenue: 1890, expenses: 4800 },
  { name: 'Jun', revenue: 2390, expenses: 3800 },
];


export default function Home() {
  const { invoices } = useInvoices();

  const formatCurrency = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
  };
  
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid' || inv.status === 'partial')
    .reduce((acc, inv) => acc + (inv.amountReceived || inv.total), 0);

  const outstandingAmount = invoices
    .filter(inv => inv.status === 'unpaid' || inv.status === 'partial')
    .reduce((acc, inv) => acc + (inv.total - (inv.status === 'partial' ? (inv.amountReceived || 0) : 0)), 0);


  return (
    <Tabs defaultValue="invoices" className="space-y-4">
      <TabsList>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="invoices">
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[50px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.client.name}</TableCell>
                      <TableCell>{format(new Date(invoice.dueDate), 'PPP')}</TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.total, invoice.currency)}</TableCell>
                      <TableCell className="text-right">
                        <InvoiceActions invoiceId={invoice.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No invoices yet.</p>
                <Link href="/invoices/new" passHref>
                  <Button variant="link" className="mt-2">Create your first invoice</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports">
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue, 'USD')}</div>
                        <p className="text-xs text-muted-foreground">Based on paid and partial invoices</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{invoices.length}</div>
                        <p className="text-xs text-muted-foreground">Total number of invoices created</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(outstandingAmount, 'USD')}</div>
                        <p className="text-xs text-muted-foreground">From unpaid and partial invoices</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>
                        This is a placeholder chart with mock data.
                        <br />
                        This will be replaced with real data from your MongoDB backend.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={reportsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                            contentStyle={{
                                background: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                        <Bar dataKey="expenses" fill="hsl(var(--destructive))" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
