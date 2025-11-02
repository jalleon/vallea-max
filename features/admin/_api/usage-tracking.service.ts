/**
 * Usage Tracking Service
 * Tracks PDF scans and manages user credits for billing
 */

import { createServerClient } from '@/lib/supabase/server';

export interface UsageRecord {
  id: string;
  user_id: string;
  organization_id?: string;
  operation_type: 'pdf_scan' | 'text_extract';
  document_type?: string;
  file_size_bytes?: number;
  page_count?: number;
  credits_used: number;
  provider_used?: 'deepseek' | 'openai' | 'anthropic';
  model_used?: string;
  tokens_input?: number;
  tokens_output?: number;
  cost_estimate?: number;
  success: boolean;
  error_message?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface UserCredits {
  scan_credits_quota: number | null; // null = unlimited
  scan_credits_used: number;
  scan_credits_reset_at: string;
  can_use_own_api_keys: boolean;
}

class UsageTrackingService {
  /**
   * Calculate credits needed based on file size and page count
   * Small PDF (< 2 MB or < 10 pages): 1 credit
   * Medium PDF (2-5 MB or 10-30 pages): 2 credits
   * Large PDF (5+ MB or 30+ pages): 4 credits
   */
  calculateCreditsNeeded(fileSizeBytes: number, pageCount?: number): number {
    const fileSizeMB = fileSizeBytes / (1024 * 1024);

    // Use file size as primary metric, page count as fallback
    if (fileSizeMB >= 5 || (pageCount && pageCount >= 30)) {
      return 4; // Large
    } else if (fileSizeMB >= 2 || (pageCount && pageCount >= 10)) {
      return 2; // Medium
    } else {
      return 1; // Small
    }
  }

  /**
   * Get user's credit balance
   */
  async getUserCredits(userId: string, supabaseClient?: any): Promise<UserCredits | null> {
    const supabase = supabaseClient || createServerClient();

    const { data, error } = await supabase
      .from('users')
      .select('scan_credits_quota, scan_credits_used, scan_credits_reset_at, can_use_own_api_keys')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Failed to get user credits:', error);
      return null;
    }

    return data as UserCredits;
  }

  /**
   * Check if user has enough credits
   */
  async hasEnoughCredits(userId: string, creditsNeeded: number, supabaseClient?: any): Promise<boolean> {
    const credits = await this.getUserCredits(userId, supabaseClient);

    if (!credits) {
      console.error('No credits data returned for user:', userId);
      return false;
    }

    // Unlimited quota
    if (credits.scan_credits_quota === null) return true;

    console.log('Credits check:', {
      userId,
      quota: credits.scan_credits_quota,
      used: credits.scan_credits_used,
      needed: creditsNeeded,
      hasEnough: (credits.scan_credits_used + creditsNeeded) <= credits.scan_credits_quota
    });

    // Check if user has enough credits
    return (credits.scan_credits_used + creditsNeeded) <= credits.scan_credits_quota;
  }

  /**
   * Consume credits (atomic operation via database function)
   */
  async consumeCredits(userId: string, creditsNeeded: number, supabaseClient?: any): Promise<boolean> {
    const supabase = supabaseClient || createServerClient();

    const { data, error } = await supabase.rpc('consume_scan_credits', {
      p_user_id: userId,
      p_credits_needed: creditsNeeded,
    });

    if (error) {
      console.error('Failed to consume credits:', error);
      return false;
    }

    return data === true;
  }

  /**
   * Track a PDF scan operation
   */
  async trackUsage(record: Omit<UsageRecord, 'id' | 'created_at'>, supabaseClient?: any): Promise<boolean> {
    const supabase = supabaseClient || createServerClient();

    const { error } = await supabase
      .from('usage_tracking')
      .insert({
        ...record,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to track usage:', error);
      return false;
    }

    return true;
  }

  /**
   * Get usage statistics for a user (for billing dashboard)
   */
  async getUserUsageStats(userId: string, startDate?: Date, endDate?: Date): Promise<{
    totalScans: number;
    totalCredits: number;
    byDocumentType: Record<string, number>;
  }> {
    const supabase = createServerClient();

    let query = supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('Failed to get usage stats:', error);
      return {
        totalScans: 0,
        totalCredits: 0,
        byDocumentType: {},
      };
    }

    const records = data as UsageRecord[];

    const byDocumentType: Record<string, number> = {};
    records.forEach(record => {
      const docType = record.document_type || 'unknown';
      byDocumentType[docType] = (byDocumentType[docType] || 0) + record.credits_used;
    });

    return {
      totalScans: records.length,
      totalCredits: records.reduce((sum, r) => sum + r.credits_used, 0),
      byDocumentType,
    };
  }

  /**
   * Get all usage for billing (admin only)
   */
  async getAllUsage(startDate?: Date, endDate?: Date): Promise<UsageRecord[]> {
    const supabase = createServerClient();

    let query = supabase
      .from('usage_tracking')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('Failed to get all usage:', error);
      return [];
    }

    return data as UsageRecord[];
  }
}

export const usageTrackingService = new UsageTrackingService();
