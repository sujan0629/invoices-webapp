'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Invitation } from '@/lib/types';

const INVITATIONS_STORAGE_KEY = 'invitations';

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(INVITATIONS_STORAGE_KEY);
      if (stored) {
        setInvitations(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load invitations from localStorage', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveInvitations = useCallback((updatedInvitations: Invitation[]) => {
    try {
      localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(updatedInvitations));
      setInvitations(updatedInvitations);
    } catch (error) {
      console.error('Failed to save invitations to localStorage', error);
    }
  }, []);

  const addInvitation = useCallback((invitation: Omit<Invitation, 'status'>) => {
    const newInvitation = { ...invitation, status: 'pending' as const };
    
    const existingIndex = invitations.findIndex(inv => inv.email === newInvitation.email);
    let updatedInvitations;

    if (existingIndex > -1) {
        updatedInvitations = [...invitations];
        updatedInvitations[existingIndex] = newInvitation;
    } else {
        updatedInvitations = [...invitations, newInvitation];
    }
    
    saveInvitations(updatedInvitations);
    return newInvitation;
  }, [invitations, saveInvitations]);
  
  const verifyInvitation = useCallback((email: string, code: string): boolean => {
      const invitation = invitations.find(inv => inv.email === email && inv.code === code && inv.status === 'pending');
      return !!invitation;
  }, [invitations]);

  const acceptInvitation = useCallback((email: string) => {
    const updatedInvitations = invitations.map((inv) =>
      inv.email === email ? { ...inv, status: 'accepted' as const } : inv
    );
    saveInvitations(updatedInvitations);
  }, [invitations, saveInvitations]);

  return {
    invitations,
    loading,
    addInvitation,
    verifyInvitation,
    acceptInvitation,
  };
}
