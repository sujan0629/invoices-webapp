
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ManagedClient } from '@/lib/types';

const CLIENTS_STORAGE_KEY = 'managed-clients';

export function useClients() {
  const [clients, setClients] = useState<ManagedClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
      if (stored) {
        setClients(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load clients from localStorage', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveClients = useCallback((updatedClients: ManagedClient[]) => {
    try {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
      setClients(updatedClients);
    } catch (error) {
      console.error('Failed to save clients to localStorage', error);
    }
  }, []);

  const getClient = useCallback((id: string) => {
    return clients.find((client) => client.id === id);
  }, [clients]);

  const addClient = useCallback((client: Omit<ManagedClient, 'id'>) => {
    const newClient = { ...client, id: crypto.randomUUID() };
    const updatedClients = [...clients, newClient];
    saveClients(updatedClients);
    return newClient;
  }, [clients, saveClients]);

  const updateClient = useCallback((id: string, updatedClientData: Partial<Omit<ManagedClient, 'id'>>) => {
    const updatedClients = clients.map((client) =>
      client.id === id ? { ...client, ...updatedClientData } : client
    );
    saveClients(updatedClients);
  }, [clients, saveClients]);

  const deleteClient = useCallback((id: string) => {
    const updatedClients = clients.filter((client) => client.id !== id);
    saveClients(updatedClients);
  }, [clients, saveClients]);


  return {
    clients,
    loading,
    getClient,
    addClient,
    updateClient,
    deleteClient,
  };
}
