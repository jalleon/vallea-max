import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export type PreferenceType =
  | 'appraiser_info'
  | 'adjustment_rates'
  | 'company_info'
  | 'narrative_templates'
  | 'default_comparables_count';

interface UserPreference {
  id: string;
  user_id: string;
  organization_id: string;
  preference_type: PreferenceType;
  data: any;
  created_at: string;
  updated_at: string;
}

interface UseRememberedInputsReturn {
  preferences: Record<string, any>;
  loading: boolean;
  savePreference: (type: PreferenceType, data: any, variationName?: string) => Promise<boolean>;
  getPreference: (type: PreferenceType, variationName?: string) => any;
  getAllVariations: (type: PreferenceType) => { name: string; data: any }[];
  clearPreference: (type: PreferenceType, variationName?: string) => Promise<boolean>;
  clearAllPreferences: () => Promise<boolean>;
}

/**
 * Hook for managing user preferences for auto-populating form fields
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

  // Load all preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      // Convert array to nested object:
      // { 'company_info': { '_default': {...}, 'Office Montreal': {...} } }
      const prefsMap: Record<string, any> = {};
      (data as UserPreference[])?.forEach((pref) => {
        const [baseType, variationName] = pref.preference_type.includes(':')
          ? pref.preference_type.split(':')
          : [pref.preference_type, '_default'];

        if (!prefsMap[baseType]) {
          prefsMap[baseType] = {};
        }
        prefsMap[baseType][variationName] = pref.data;
      });

      console.log('[DEBUG] Loaded preferences from DB:', {
        totalRecords: data?.length,
        companyInfoRecords: data?.filter(d => d.preference_type.startsWith('company_info')),
        processedCompanyInfo: prefsMap.company_info
      });

      setPreferences(prefsMap);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreference = async (
    type: PreferenceType,
    data: any,
    variationName?: string
  ): Promise<boolean> => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        return false;
      }

      // Get organization_id from user metadata or profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      // Try to get organization_id from profile or user metadata
      let organizationId = profile?.organization_id || user.user_metadata?.organization_id;

      if (!organizationId) {
        console.error('No organization_id found for user. Profile:', profile, 'User metadata:', user.user_metadata);
        return false;
      }

      // Create composite key: "type:variationName" or just "type" for default
      const preferenceKey = variationName ? `${type}:${variationName}` : type;

      console.log('[DEBUG] Saving preference:', {
        type,
        variationName,
        preferenceKey,
        dataKeys: Object.keys(data),
        existingVariations: Object.keys(preferences[type] || {})
      });

      // Upsert preference (insert or update)
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          organization_id: organizationId,
          preference_type: preferenceKey as any,
          data: data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,organization_id,preference_type'
        });

      if (error) {
        console.error('Error saving preference:', error);
        return false;
      }

      console.log('[DEBUG] Saved successfully, updating local state');

      // Update local state
      setPreferences((prev) => {
        const updated = {
          ...prev,
          [type]: {
            ...(prev[type] || {}),
            [variationName || '_default']: data
          }
        };
        console.log('[DEBUG] Updated local state:', {
          type,
          newVariations: Object.keys(updated[type] || {})
        });
        return updated;
      });

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const preferenceKey = variationName ? `${type}:${variationName}` : type;

      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id)
        .eq('preference_type', preferenceKey);

      if (error) {
        console.error('Error clearing preference:', error);
        return false;
      }

      // Update local state
      setPreferences((prev) => {
        const newPrefs = { ...prev };
        if (variationName) {
          // Remove specific variation
          if (newPrefs[type]) {
            const typePrefs = { ...newPrefs[type] };
            delete typePrefs[variationName];
            newPrefs[type] = typePrefs;
          }
        } else {
          // Remove default variation
          if (newPrefs[type]) {
            const typePrefs = { ...newPrefs[type] };
            delete typePrefs['_default'];
            newPrefs[type] = typePrefs;
          }
        }
        return newPrefs;
      });

      return true;
    } catch (error) {
      console.error('Error clearing preference:', error);
      return false;
    }
  };

  const clearAllPreferences = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing all preferences:', error);
        return false;
      }

      // Clear local state
      setPreferences({});

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
