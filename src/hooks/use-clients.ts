
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ManagedClient } from '@/lib/types';
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
} from 'firebase/firestore';

const CLIENTS_COLLECTION = 'clients';

export function useClients() {
  const [clients, setClients] = useState<ManagedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, is2faVerified } = useAuth();

  useEffect(() => {
    if (!user || !is2faVerified) {
      setClients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, CLIENTS_COLLECTION), orderBy('name'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const clientsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ManagedClient[];
        setClients(clientsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching clients:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, is2faVerified]);

  const getClient = useCallback(
    (id: string) => {
      return clients.find((client) => client.id === id);
    },
    [clients]
  );

  const addClient = useCallback(
    async (client: Omit<ManagedClient, 'id'>) => {
      if (!user) throw new Error('User not authenticated');
      const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), client);
      return { ...client, id: docRef.id } as ManagedClient;
    },
    [user]
  );

  const updateClient = useCallback(
    async (id: string, updatedClientData: Partial<Omit<ManagedClient, 'id'>>) => {
      if (!user) throw new Error('User not authenticated');
      const clientDoc = doc(db, CLIENTS_COLLECTION, id);
      await updateDoc(clientDoc, updatedClientData);
    },
    [user]
  );

  const deleteClient = useCallback(
    async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      const clientDoc = doc(db, CLIENTS_COLLECTION, id);
      await deleteDoc(clientDoc);
    },
    [user]
  );

  return {
    clients,
    loading,
    getClient,
    addClient,
    updateClient,
    deleteClient,
  };
}
