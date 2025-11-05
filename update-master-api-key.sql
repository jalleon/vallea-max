-- Update the master DeepSeek API key
-- IMPORTANT: Replace 'YOUR_VALID_DEEPSEEK_API_KEY' with a valid DeepSeek API key

-- First, check current key
SELECT
  id,
  provider,
  LEFT(api_key, 10) || '...' as api_key_preview,
  model,
  priority,
  is_active,
  created_at
FROM admin_api_keys
WHERE provider = 'deepseek'
ORDER BY priority DESC;

-- Update the key (replace with your actual valid key)
UPDATE admin_api_keys
SET
  api_key = 'YOUR_VALID_DEEPSEEK_API_KEY',  -- REPLACE THIS
  updated_at = now()
WHERE provider = 'deepseek' AND is_active = true;

-- Verify the update
SELECT
  id,
  provider,
  LEFT(api_key, 10) || '...' as api_key_preview,
  model,
  priority,
  is_active,
  updated_at
FROM admin_api_keys
WHERE provider = 'deepseek'
ORDER BY priority DESC;
