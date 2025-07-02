
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AppSettings } from '@/lib/types';
import { COMPANY_PROFILE as defaultCompanyProfile } from '@/lib/company';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'app-settings';

const initialSettings: AppSettings = {
  company: defaultCompanyProfile,
  defaults: {
    vatPercent: 13,
    tdsPercent: 1.5,
  },
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const { user, is2faVerified } = useAuth();

  useEffect(() => {
    if (!user || !is2faVerified) {
      setSettings(initialSettings);
      setLoading(false);
      return;
    }

    setLoading(true);
    const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

    const unsubscribe = onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as AppSettings);
        } else {
          setDoc(settingsDocRef, initialSettings).catch((error) => {
            console.error('Failed to initialize settings in Firestore', error);
          });
          setSettings(initialSettings);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Failed to load settings from Firestore', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, is2faVerified]);

  const updateSettings = useCallback(
    async (updatedSettings: AppSettings) => {
      if (!user) throw new Error('User not authenticated');
      const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      await setDoc(settingsDocRef, updatedSettings, { merge: true });
    },
    [user]
  );

  return {
    settings,
    loading,
    updateSettings,
  };
}
