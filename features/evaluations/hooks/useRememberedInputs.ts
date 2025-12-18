import { useState, useEffect } from 'react';

export type PreferenceType =
  | 'appraiser_info'
  | 'adjustment_rates'
  | 'company_info'
  | 'narrative_templates'
  | 'default_comparables_count';

interface UseRememberedInputsReturn {
  preferences: Record<string, any>;
  loading: boolean;
  savePreference: (type: PreferenceType, data: any, variationName?: string) => Promise<boolean>;
  getPreference: (type: PreferenceType, variationName?: string) => any;
  getAllVariations: (type: PreferenceType) => { name: string; data: any }[];
  clearPreference: (type: PreferenceType, variationName?: string) => Promise<boolean>;
  clearAllPreferences: () => Promise<boolean>;
}

const STORAGE_KEY = 'valea_user_preferences';

/**
 * Hook for managing user preferences for auto-populating form fields
 * Uses localStorage for persistence (no database table required)
 * Supports multiple named variations per preference type
 *
 * Usage:
 * ```typescript
 * const { preferences, savePreference, getPreference, getAllVariations } = useRememberedInputs();
 *
 * // Save default appraiser info
 * await savePreference('appraiser_info', {
 *   name: 'John Doe',
 *   license: '12345',
 *   email: 'john@example.com'
 * });
 *
 * // Save named variation
 * await savePreference('company_info', { ... }, 'Office Montreal');
 * await savePreference('company_info', { ... }, 'Office Toronto');
 *
 * // Get default preference
 * const appraiserInfo = getPreference('appraiser_info');
 *
 * // Get specific variation
 * const montrealOffice = getPreference('company_info', 'Office Montreal');
 *
 * // Get all variations
 * const allOffices = getAllVariations('company_info');
 * // Returns: [{ name: 'Office Montreal', data: {...} }, { name: 'Office Toronto', data: {...} }]
 * ```
 */
export function useRememberedInputs(): UseRememberedInputsReturn {
  const [preferences, setPreferences] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      setLoading(true);

      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
      }
    } catch (error) {
      console.error('Error loading preferences from localStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (prefs: Record<string, any>) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      }
    } catch (error) {
      console.error('Error saving preferences to localStorage:', error);
    }
  };

  const savePreference = async (
    type: PreferenceType,
    data: any,
    variationName?: string
  ): Promise<boolean> => {
    try {
      const key = variationName || '_default';

      const updated = {
        ...preferences,
        [type]: {
          ...(preferences[type] || {}),
          [key]: data
        }
      };

      setPreferences(updated);
      saveToStorage(updated);

      return true;
    } catch (error) {
      console.error('Error saving preference:', error);
      return false;
    }
  };

  const getPreference = (type: PreferenceType, variationName?: string): any => {
    const typePrefs = preferences[type];
    if (!typePrefs) return null;

    // Return specific variation or default
    return typePrefs[variationName || '_default'] || null;
  };

  const getAllVariations = (type: PreferenceType): { name: string; data: any }[] => {
    const typePrefs = preferences[type];
    if (!typePrefs) return [];

    return Object.entries(typePrefs)
      .filter(([name]) => name !== '_default')
      .map(([name, data]) => ({ name, data }));
  };

  const clearPreference = async (
    type: PreferenceType,
    variationName?: string
  ): Promise<boolean> => {
    try {
      const updated = { ...preferences };

      if (variationName) {
        // Remove specific variation
        if (updated[type]) {
          const typePrefs = { ...updated[type] };
          delete typePrefs[variationName];
          updated[type] = typePrefs;
        }
      } else {
        // Remove default variation
        if (updated[type]) {
          const typePrefs = { ...updated[type] };
          delete typePrefs['_default'];
          updated[type] = typePrefs;
        }
      }

      setPreferences(updated);
      saveToStorage(updated);

      return true;
    } catch (error) {
      console.error('Error clearing preference:', error);
      return false;
    }
  };

  const clearAllPreferences = async (): Promise<boolean> => {
    try {
      setPreferences({});
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      return true;
    } catch (error) {
      console.error('Error clearing all preferences:', error);
      return false;
    }
  };

  return {
    preferences,
    loading,
    savePreference,
    getPreference,
    getAllVariations,
    clearPreference,
    clearAllPreferences
  };
}
