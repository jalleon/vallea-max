-- Migration: Add AI API Keys to existing user preferences
-- This updates all existing users to have the new aiApiKeys and aiModels fields

UPDATE users
SET preferences = jsonb_set(
  jsonb_set(
    COALESCE(preferences, '{}'::jsonb),
    '{aiApiKeys}',
    '{"deepseek": null, "openai": null, "anthropic": null}'::jsonb,
    true
  ),
  '{aiModels}',
  '{"deepseek": "deepseek-chat", "openai": "gpt-4o-mini", "anthropic": "claude-3-5-haiku-20241022"}'::jsonb,
  true
)
WHERE preferences IS NULL
   OR NOT (preferences ? 'aiApiKeys')
   OR NOT (preferences ? 'aiModels');
