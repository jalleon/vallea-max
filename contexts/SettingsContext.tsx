'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService, UserPreferences } from '@/features/user-settings/_api/settings.service';

interface SettingsContextType {
  preferences: UserPreferences | null;
  loading: boolean;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<boolean>;
  updateAiApiKeys: (apiKeys: Partial<UserPreferences['aiApiKeys']>, models?: Partial<UserPreferences['aiModels']>, providerPriority?: UserPreferences['providerPriority']) => Promise<boolean>;
  refreshPreferences: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPreferences = async () => {
    setLoading(true);
    const profile = await settingsService.getUserProfile();
    if (profile) {
      setPreferences(profile.preferences);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const updatePreferences = async (newPreferences: Partial<UserPreferences>): Promise<boolean> => {
    const success = await settingsService.updatePreferences(newPreferences);
    if (success) {
      await loadPreferences();
    }
    return success;
  };

  const updateAiApiKeys = async (
    apiKeys: Partial<UserPreferences['aiApiKeys']>,
    models?: Partial<UserPreferences['aiModels']>,
    providerPriority?: UserPreferences['providerPriority']
  ): Promise<boolean> => {
    const success = await settingsService.updateAiApiKeys(apiKeys, models, providerPriority);
    if (success) {
      await loadPreferences();
    }
    return success;
  };

  const refreshPreferences = async () => {
    await loadPreferences();
  };

  return (
    <SettingsContext.Provider
      value={{
        preferences,
        loading,
        updatePreferences,
        updateAiApiKeys,
        refreshPreferences,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
