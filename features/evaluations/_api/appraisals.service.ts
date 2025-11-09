import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

type Appraisal = Database['public']['Tables']['appraisals']['Row'];
type AppraisalInsert = Database['public']['Tables']['appraisals']['Insert'];
type AppraisalUpdate = Database['public']['Tables']['appraisals']['Update'];

export const appraisalsService = {
  /**
   * Get all appraisals for the current user's organization
   */
  getAll: async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('appraisals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Appraisal[];
  },

  /**
   * Get a single appraisal by ID
   */
  getById: async (id: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('appraisals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Appraisal;
  },

  /**
   * Create a new appraisal
   */
  create: async (appraisal: AppraisalInsert) => {
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const organizationId = user.user_metadata?.organization_id;
    if (!organizationId) throw new Error('No organization found');

    const { data, error } = await supabase
      .from('appraisals')
      .insert({
        ...appraisal,
        organization_id: organizationId,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Appraisal;
  },

  /**
   * Update an existing appraisal
   */
  update: async (id: string, updates: AppraisalUpdate) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('appraisals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Appraisal;
  },

  /**
   * Delete an appraisal
   */
  delete: async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('appraisals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get appraisals by status
   */
  getByStatus: async (status: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('appraisals')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Appraisal[];
  },

  /**
   * Get appraisals by template type
   */
  getByTemplateType: async (templateType: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('appraisals')
      .select('*')
      .eq('template_type', templateType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Appraisal[];
  }
};
