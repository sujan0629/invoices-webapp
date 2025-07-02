
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
        setInvoices(JSON.parse(storedInvoices));
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

  const getInvoice = useCallback((id: string) => {
    return invoices.find((invoice) => invoice.id === id);
  }, [invoices]);

  const addInvoice = useCallback((invoice: Invoice) => {
    const newInvoice = { ...invoice, id: crypto.randomUUID() };
    const updatedInvoices = [...invoices, newInvoice];
    saveInvoices(updatedInvoices);
    return newInvoice;
  }, [invoices, saveInvoices]);

  const updateInvoice = useCallback((id: string, updatedInvoiceData: Partial<Invoice>) => {
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
