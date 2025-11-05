/**
 * Admin API Keys Service
 * Manages Valea's master API keys for AI services
 * Uses service role to bypass RLS
 */

import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export interface AdminApiKey {
  id: string;
  provider: 'deepseek' | 'openai' | 'anthropic';
  api_key: string;
  model: string;
  is_active: boolean;
  priority: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

class AdminApiKeysService {
  /**
   * Create a service role client that can bypass RLS
   * Use this in API routes where createServerClient doesn't work
   */
  private getServiceClient() {
    // Use service role key to bypass RLS
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Get active API key for a provider (highest priority first)
   */
  async getActiveKeyForProvider(provider: 'deepseek' | 'openai' | 'anthropic'): Promise<AdminApiKey | null> {
    // Use service client to bypass RLS
    const supabase = this.getServiceClient();

    const { data, error } = await supabase
      .from('admin_api_keys')
      .select('*')
      .eq('provider', provider)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error(`Failed to get active key for ${provider}:`, error);
      return null;
    }

    return data as AdminApiKey;
  }

  /**
   * Get all active API keys (ordered by priority)
   */
  async getAllActiveKeys(): Promise<AdminApiKey[]> {
    const supabase = this.getServiceClient();

    const { data, error } = await supabase
      .from('admin_api_keys')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Failed to get active keys:', error);
      return [];
    }

    return (data as AdminApiKey[]) || [];
  }

  /**
   * Get API keys with priority order: deepseek > openai > anthropic
   * Returns first available active key
   */
  async getDefaultApiKey(): Promise<{ provider: 'deepseek' | 'openai' | 'anthropic'; apiKey: string; model: string } | null> {
    const providers: ('deepseek' | 'openai' | 'anthropic')[] = ['deepseek', 'openai', 'anthropic'];

    for (const provider of providers) {
      const key = await this.getActiveKeyForProvider(provider);
      if (key) {
        return {
          provider: key.provider,
          apiKey: key.api_key,
          model: key.model,
        };
      }
    }

    console.error('No active admin API keys found!');
    return null;
  }

  /**
   * Add or update an admin API key
   * (Admin-only operation - requires service role)
   */
  async upsertKey(key: Omit<AdminApiKey, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    const supabase = this.getServiceClient();

    const { error } = await supabase
      .from('admin_api_keys')
      .upsert({
        ...key,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to upsert admin API key:', error);
      return false;
    }

    return true;
  }

  /**
   * Deactivate an API key
   */
  async deactivateKey(id: string): Promise<boolean> {
    const supabase = this.getServiceClient();

    const { error } = await supabase
      .from('admin_api_keys')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Failed to deactivate API key:', error);
      return false;
    }

    return true;
  }
}

export const adminApiKeysService = new AdminApiKeysService();
