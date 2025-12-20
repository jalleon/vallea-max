-- Check if master API key exists
SELECT
  id,
  provider,
  priority,
  is_active,
  notes,
  created_at
FROM admin_api_keys
WHERE is_active = true
ORDER BY priority DESC;

-- If no master key exists, insert Valea's DeepSeek key
INSERT INTO admin_api_keys (provider, api_key, model, is_active, priority, notes)
VALUES (
  'deepseek',
  'sk-cbb5f7b26914440b992e68b0f61f5b48',
  'deepseek-chat',
  true,
  100,
  'Valea master DeepSeek API key for PDF imports'
)
ON CONFLICT DO NOTHING;

-- Verify the key is now in the database
SELECT
  id,
  provider,
  model,
  priority,
  is_active,
  notes,
  created_at
FROM admin_api_keys
WHERE is_active = true
ORDER BY priority DESC;
