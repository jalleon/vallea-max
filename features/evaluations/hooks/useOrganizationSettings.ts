import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface OrganizationSettings {
  companyAddress?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyLogoUrl?: string;
}

export function useOrganizationSettings() {
  const [settings, setSettings] = useState<OrganizationSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const supabase = createClient();

    try {
      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      // Load organization settings
      const { data: orgData } = await supabase
        .from('organizations')
        .select('appraisal_settings')
        .eq('id', profile.organization_id)
        .single();

      if (orgData?.appraisal_settings) {
        setSettings(orgData.appraisal_settings as any);
      }
    } catch (error) {
      console.error('Error loading organization settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: OrganizationSettings) => {
    const supabase = createClient();

    try {
      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        return { success: false, error: 'Organization not found' };
      }

      // Save settings
      const { error } = await supabase
        .from('organizations')
        .update({
          appraisal_settings: newSettings as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.organization_id);

      if (error) {
        console.error('Error saving organization settings:', error);
        return { success: false, error: error.message };
      }

      setSettings(newSettings);
      return { success: true };
    } catch (error: any) {
      console.error('Error saving organization settings:', error);
      return { success: false, error: error.message };
    }
  };

  return { settings, loading, saveSettings, reloadSettings: loadSettings };
}
