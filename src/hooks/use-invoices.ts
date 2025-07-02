
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Invoice } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

const INVOICES_COLLECTION = 'invoices';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, is2faVerified } = useAuth();

  useEffect(() => {
    if (!user || !is2faVerified) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, INVOICES_COLLECTION), orderBy('issueDate', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const invoicesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            issueDate: (data.issueDate as Timestamp).toDate().toISOString(),
            dueDate: (data.dueDate as Timestamp).toDate().toISOString(),
            transactions:
              data.transactions?.map((tx: any) => ({
                ...tx,
                date: (tx.date as Timestamp).toDate().toISOString(),
              })) || [],
          } as Invoice;
        });
        setInvoices(invoicesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching invoices:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, is2faVerified]);

  const getInvoice = useCallback(
    (identifier: string, by: 'id' | 'invoiceNumber' = 'id') => {
      if (by === 'id') {
        return invoices.find((invoice) => invoice.id === identifier);
      }
      return invoices.find(
        (invoice) => invoice.invoiceNumber.toLowerCase() === identifier.toLowerCase()
      );
    },
    [invoices]
  );

  const addInvoice = useCallback(
    async (invoice: Omit<Invoice, 'id'>) => {
      if (!user) throw new Error('User not authenticated');
      const docRef = await addDoc(collection(db, INVOICES_COLLECTION), invoice);
      return { ...invoice, id: docRef.id } as Invoice;
    },
    [user]
  );

  const updateInvoice = useCallback(
    async (id: string, updatedInvoiceData: Partial<Omit<Invoice, 'id'>>) => {
      if (!user) throw new Error('User not authenticated');
      const invoiceDoc = doc(db, INVOICES_COLLECTION, id);
      await updateDoc(invoiceDoc, updatedInvoiceData);
    },
    [user]
  );

  const deleteInvoice = useCallback(
    async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      const invoiceDoc = doc(db, INVOICES_COLLECTION, id);
      await deleteDoc(invoiceDoc);
    },
    [user]
  );

  const getPreviousLineItems = useCallback((): string[] => {
    const allDescriptions = invoices.flatMap((invoice) =>
      invoice.lineItems.map((item) => item.description)
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
