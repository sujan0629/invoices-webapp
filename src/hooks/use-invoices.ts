
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Invoice, LineItem } from '@/lib/types';

const INVOICES_STORAGE_KEY = 'invoices';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem(INVOICES_STORAGE_KEY);
      if (storedInvoices) {
        const parsedInvoices = JSON.parse(storedInvoices);
        // Simple migration for old invoices without a currency field
        const migratedInvoices = parsedInvoices.map((inv: Invoice) => ({
          ...inv,
          currency: inv.currency || 'USD',
        }));
        setInvoices(migratedInvoices);
      }
    } catch (error) {
      console.error('Failed to load invoices from localStorage', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveInvoices = useCallback((updatedInvoices: Invoice[]) => {
    try {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
    } catch (error) {
      console.error('Failed to save invoices to localStorage', error);
    }
  }, []);

  const getInvoice = useCallback((identifier: string, by: 'id' | 'invoiceNumber' = 'id') => {
    if (by === 'id') {
        return invoices.find((invoice) => invoice.id === identifier);
    }
    return invoices.find((invoice) => invoice.invoiceNumber.toLowerCase() === identifier.toLowerCase());
  }, [invoices]);

  const addInvoice = useCallback((invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = { ...invoice, id: crypto.randomUUID() };
    const updatedInvoices = [...invoices, newInvoice as Invoice];
    saveInvoices(updatedInvoices);
    return newInvoice;
  }, [invoices, saveInvoices]);

  const updateInvoice = useCallback((id: string, updatedInvoiceData: Partial<Omit<Invoice, 'id'>>) => {
    const updatedInvoices = invoices.map((invoice) =>
      invoice.id === id ? { ...invoice, ...updatedInvoiceData } : invoice
    );
    saveInvoices(updatedInvoices);
  }, [invoices, saveInvoices]);

  const deleteInvoice = useCallback((id: string) => {
    const updatedInvoices = invoices.filter((invoice) => invoice.id !== id);
    saveInvoices(updatedInvoices);
  }, [invoices, saveInvoices]);

  const getPreviousLineItems = useCallback((): string[] => {
    const allDescriptions = invoices.flatMap(invoice => 
        invoice.lineItems.map(item => item.description)
    );
    return [...new Set(allDescriptions)]; // Return unique descriptions
  }, [invoices]);

  return {
    invoices,
    loading,
    getInvoice,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getPreviousLineItems,
  };
}
