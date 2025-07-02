
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AppSettings } from '@/lib/types';
import { COMPANY_PROFILE as defaultCompanyProfile } from '@/lib/company';

const SETTINGS_STORAGE_KEY = 'app-settings';

const initialSettings: AppSettings = {
    company: defaultCompanyProfile,
    defaults: {
        vatPercent: 13,
        tdsPercent: 1.5,
    }
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      } else {
        // If no settings, save the initial defaults
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(initialSettings));
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback((updatedSettings: AppSettings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
    }
  }, []);

  return {
    settings,
    loading,
    updateSettings,
  };
}
