/**
 * User Settings Service
 * Manages user preferences including AI API keys
 */

import { createClient } from '@/lib/supabase/client';

export interface UserPreferences {
  language: 'fr' | 'en';
  currency: string;
  theme: 'light' | 'dark';
  aiApiKeys: {
    deepseek: string | null;
    openai: string | null;
    anthropic: string | null;
  };
  aiModels: {
    deepseek: string;
    openai: string;
    anthropic: string;
  };
  providerPriority: ('deepseek' | 'openai' | 'anthropic')[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  organization_id: string;
  role: string;
  preferences: UserPreferences;
  created_at: string;
}

const supabase = createClient();

export const settingsService = {
  /**
   * Get current user's profile and preferences
   */
  async getUserProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    // Ensure aiApiKeys, aiModels, and providerPriority exist in preferences
    const profile = data as UserProfile;
    if (!profile.preferences.aiApiKeys || !profile.preferences.aiModels || !profile.preferences.providerPriority) {
      profile.preferences = {
        ...profile.preferences,
        aiApiKeys: profile.preferences.aiApiKeys || {
          deepseek: null,
          openai: null,
          anthropic: null,
        },
        aiModels: profile.preferences.aiModels || {
          deepseek: 'deepseek-chat',
          openai: 'gpt-4o-mini',
          anthropic: 'claude-3-5-haiku-20241022',
        },
        providerPriority: profile.preferences.providerPriority || ['deepseek', 'openai', 'anthropic'],
      };
    }

    return profile;
  },

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    // Get current preferences
    const { data: currentUser } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', user.id)
      .single();

    if (!currentUser) {
      return false;
    }

    // Merge with existing preferences
    const updatedPreferences = {
      ...(currentUser.preferences as any),
      ...preferences,
    };

    const { error } = await supabase
      .from('users')
      .update({
        preferences: updatedPreferences as any
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating preferences:', error);
      return false;
    }

    return true;
  },

  /**
   * Update AI API keys, models, and provider priority
   */
  async updateAiApiKeys(
    apiKeys: Partial<UserPreferences['aiApiKeys']>,
    models?: Partial<UserPreferences['aiModels']>,
    providerPriority?: UserPreferences['providerPriority']
  ): Promise<boolean> {
    try {
      console.log('updateAiApiKeys called with:', { apiKeys, models });

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('No authenticated user found');
        return false;
      }

      console.log('User ID:', user.id);

      // Get current preferences
      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching user preferences:', fetchError);
        return false;
      }

      if (!currentUser) {
        console.error('User not found in database');
        return false;
      }

      console.log('Current preferences:', currentUser.preferences);

      const currentPreferences = (currentUser.preferences as any) || {};

      // Initialize aiApiKeys and aiModels if they don't exist
      const defaultAiApiKeys = {
        deepseek: null,
        openai: null,
        anthropic: null,
      };

      const defaultAiModels = {
        deepseek: 'deepseek-chat',
        openai: 'gpt-4o-mini',
        anthropic: 'claude-3-5-haiku-20241022',
      };

      // Merge AI API keys, models, and provider priority
      const updatedPreferences = {
        ...currentPreferences,
        aiApiKeys: {
          ...(currentPreferences.aiApiKeys || defaultAiApiKeys),
          ...apiKeys,
        },
        aiModels: {
          ...(currentPreferences.aiModels || defaultAiModels),
          ...(models || {}),
        },
        providerPriority: providerPriority || currentPreferences.providerPriority || ['deepseek', 'openai', 'anthropic'],
      };

      console.log('Updated preferences to save:', updatedPreferences);

      const { error } = await supabase
        .from('users')
        .update({
          preferences: updatedPreferences as any
        })
        .eq('id', user.id);

      if (error) {
        console.error('Supabase update error:', error);
        return false;
      }

      console.log('AI API keys updated successfully');
      return true;
    } catch (error) {
      console.error('Exception in updateAiApiKeys:', error);
      return false;
    }
  },

  /**
   * Get AI API key for a specific provider
   */
  async getAiApiKey(provider: 'deepseek' | 'openai' | 'anthropic'): Promise<string | null> {
    const profile = await this.getUserProfile();

    if (!profile || !profile.preferences.aiApiKeys) {
      return null;
    }

    return profile.preferences.aiApiKeys[provider];
  },
};
