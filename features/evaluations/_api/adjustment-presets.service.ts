import { createClient } from '@/lib/supabase/client';
import { DefaultRates, PropertyType, OrganizationAdjustmentPreset } from '../types/adjustments.types';

const supabase = createClient();

export const adjustmentPresetsService = {
  /**
   * Get organization-level default rates for a specific property type
   */
  async getOrganizationPreset(propertyType: PropertyType): Promise<DefaultRates | null> {
    const { data, error } = await (supabase as any)
      .from('organization_adjustment_presets')
      .select('rates')
      .eq('property_type', propertyType)
      .single();

    if (error) {
      console.error('Error fetching organization preset:', error);
      return null;
    }

    return data?.rates as unknown as DefaultRates;
  },

  /**
   * Get all organization-level presets
   */
  async getAllOrganizationPresets(): Promise<Record<PropertyType, DefaultRates>> {
    const { data, error } = await (supabase as any)
      .from('organization_adjustment_presets')
      .select('property_type, rates');

    if (error) {
      console.error('Error fetching organization presets:', error);
      return {} as Record<PropertyType, DefaultRates>;
    }

    const presets: any = {};
    data?.forEach((preset: any) => {
      presets[preset.property_type] = preset.rates;
    });

    return presets;
  },

  /**
   * Save or update organization-level default rates for a property type
   */
  async saveOrganizationPreset(
    propertyType: PropertyType,
    rates: DefaultRates
  ): Promise<{ success: boolean; error?: string }> {
    // Get current user's organization_id
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (!profile?.organization_id) {
      return { success: false, error: 'Organization not found' };
    }

    // Upsert the preset
    const { error } = await (supabase as any)
      .from('organization_adjustment_presets')
      .upsert({
        organization_id: profile.organization_id,
        property_type: propertyType,
        rates: rates as any,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'organization_id,property_type'
      });

    if (error) {
      console.error('Error saving organization preset:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  /**
   * Delete organization-level preset for a property type
   */
  async deleteOrganizationPreset(propertyType: PropertyType): Promise<{ success: boolean; error?: string }> {
    const { error } = await (supabase as any)
      .from('organization_adjustment_presets')
      .delete()
      .eq('property_type', propertyType);

    if (error) {
      console.error('Error deleting organization preset:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }
};
