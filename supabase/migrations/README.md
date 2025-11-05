# Database Migrations for Valea Max

This directory contains SQL migrations to set up the Valea Max database schema.

## How to Run Migrations

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file
4. Execute them in order by timestamp

### Option 2: Using Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run all pending migrations
supabase db push
```

## Migration Files

### 20251102165653_add_master_api_keys_and_usage_tracking.sql
Creates:
- `admin_api_keys` table - Stores Valea's master API keys for AI services (DeepSeek, OpenAI, Anthropic)
- `usage_tracking` table - Tracks API usage for billing purposes
- Adds credit system columns to `users` table:
  - `can_use_own_api_keys` - Allow users to use their own API keys
  - `scan_credits_quota` - Monthly credit quota (default: 20)
  - `scan_credits_used` - Current month's usage
  - `scan_credits_reset_at` - Next reset date
  - `api_key_secret_enabled` - Security flag
- Functions for credit management:
  - `reset_monthly_scan_credits()` - Reset credits monthly
  - `consume_scan_credits(user_id, credits_needed)` - Check and consume credits

### 20251104000000_add_subscriptions_and_waitlist.sql
Creates:
- `user_subscriptions` table - Stripe subscription management
  - Tracks subscription status, plan type, billing periods
  - Integrates with Stripe webhooks
- `waitlist` table - Pre-launch email collection
  - Stores email, name, locale for marketing
  - Public insert access for landing page
- Trigger function to auto-update `updated_at` timestamps

## After Running Migrations

### 1. Update TypeScript Types
The TypeScript database types in `types/database.types.ts` have been manually updated to match the new schema. If you regenerate types using Supabase CLI, ensure these tables are included:
- `admin_api_keys`
- `usage_tracking`
- `user_subscriptions`
- `waitlist`

And ensure the `users` table includes credit-related columns.

### 2. Configure Environment Variables
Make sure your `.env.local` includes:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key

# Mailjet
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_SECRET_KEY=your_mailjet_secret_key
MAILJET_FROM_EMAIL=your_from_email
MAILJET_FROM_NAME=your_from_name
```

### 3. Insert Master API Keys
After running the first migration, update the `admin_api_keys` table with your actual API keys:
```sql
-- Replace the placeholder key with your actual DeepSeek API key
UPDATE admin_api_keys
SET api_key = 'your-actual-deepseek-key'
WHERE provider = 'deepseek';

-- Add OpenAI key (optional)
INSERT INTO admin_api_keys (provider, api_key, model, is_active, priority, notes)
VALUES ('openai', 'your-openai-key', 'gpt-4', true, 90, 'OpenAI GPT-4 for advanced extraction');

-- Add Anthropic key (optional)
INSERT INTO admin_api_keys (provider, api_key, model, is_active, priority, notes)
VALUES ('anthropic', 'your-anthropic-key', 'claude-3-opus', true, 80, 'Claude for complex documents');
```

## Troubleshooting

### Error: Table already exists
If you see "relation already exists" errors, the tables are already created. You can safely ignore these errors or use `CREATE TABLE IF NOT EXISTS` (already included in migrations).

### Error: Column already exists
If user credit columns already exist, the migration uses `ADD COLUMN IF NOT EXISTS` to safely skip them.

### RLS Policies Not Working
Ensure you're using the service role key for admin operations and the anon key for client-side operations. Row Level Security (RLS) is enabled on all tables.

## Manual Type Generation (If Needed)

If you need to regenerate TypeScript types from the database:

```bash
# Generate types using Supabase CLI
supabase gen types typescript --project-id your-project-ref > types/database.types.generated.ts

# Then manually merge with existing types/database.types.ts
# Be careful not to overwrite custom modifications
```

## Notes

- All timestamps use `TIMESTAMPTZ` for proper timezone handling
- UUIDs are automatically generated using `gen_random_uuid()`
- Foreign keys have `ON DELETE CASCADE` where appropriate
- Indexes are created for common query patterns
- RLS policies enforce multi-tenant data isolation
