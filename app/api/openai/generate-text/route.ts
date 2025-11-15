/**
 * API Route for OpenAI text generation
 * Used by AI Writing Assistant in appraisal forms
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createRouteClient } from '@/lib/supabase/server';
import { adminApiKeysService } from '@/features/admin/_api/admin-api-keys.service';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt, maxTokens = 500 } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      );
    }

    // Check if user has enabled their own API keys
    const { data: userData } = await supabase
      .from('users')
      .select('can_use_own_api_keys')
      .eq('id', user.id)
      .single() as { data: { can_use_own_api_keys: boolean } | null; error: any };

    const canUseOwnKeys = userData?.can_use_own_api_keys || false;

    let apiKey: string;
    let provider: string;
    let model: string;

    // If user wants to use their own keys, get them from settings
    if (canUseOwnKeys) {
      // Get user's API keys from settings
      const { data: apiKeysData } = await supabase
        .from('users')
        .select('openai_api_key')
        .eq('id', user.id)
        .single() as { data: { openai_api_key?: string } | null; error: any };

      if (!apiKeysData?.openai_api_key) {
        return NextResponse.json(
          { error: 'Please configure your OpenAI API key in Settings.' },
          { status: 400 }
        );
      }

      apiKey = apiKeysData.openai_api_key;
      provider = 'openai';
      model = 'gpt-4o-mini';
    } else {
      // Use master API key
      const masterKey = await adminApiKeysService.getDefaultApiKey();

      if (!masterKey) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }

      apiKey = masterKey.apiKey;
      provider = masterKey.provider;
      model = masterKey.model;
    }

    // Initialize OpenAI client based on provider
    let client: OpenAI;

    if (provider === 'openai') {
      client = new OpenAI({ apiKey });
    } else if (provider === 'deepseek') {
      client = new OpenAI({
        apiKey,
        baseURL: 'https://api.deepseek.com/v1'
      });
    } else {
      return NextResponse.json(
        { error: 'Unsupported AI provider' },
        { status: 400 }
      );
    }

    // Generate text using OpenAI
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional real estate appraiser writing assistant. Write clear, concise, and professional appraisal narratives. Use industry-standard terminology and maintain an objective, factual tone.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const generatedText = completion.choices[0]?.message?.content || '';

    if (!generatedText) {
      return NextResponse.json(
        { error: 'Failed to generate text' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      text: generatedText,
      model,
      provider,
      tokens: completion.usage?.total_tokens || 0
    });

  } catch (error) {
    console.error('OpenAI text generation error:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate text' },
      { status: 500 }
    );
  }
}
