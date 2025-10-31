# Database Migrations

## How to Run Migrations

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file you want to run
4. Paste into the SQL Editor
5. Click **Run**

### Option 2: Via Supabase CLI
```bash
supabase db execute --file lib/supabase/migrations/add-ai-api-keys.sql
```

## Available Migrations

### add-ai-api-keys.sql
**Purpose**: Adds `aiApiKeys` and `aiModels` fields to existing user preferences.

**When to run**:
- After pulling the latest code with AI API keys feature
- If users see "Erreur lors de l'enregistrement des clés API"

**What it does**:
- Updates all users' preferences JSONB to include:
  - `aiApiKeys`: { deepseek: null, openai: null, anthropic: null }
  - `aiModels`: { deepseek: "deepseek-chat", openai: "gpt-4o-mini", anthropic: "claude-3-5-haiku-20241022" }

**Safe to run multiple times**: Yes (uses conditional update)

## Note About Backward Compatibility

The application code has been updated to handle missing fields gracefully:
- `settingsService.getUserProfile()` initializes missing fields on read
- `settingsService.updateAiApiKeys()` initializes missing fields before update

This means **the migration is optional** - the app will work without it, but running the migration will prevent unnecessary field initialization on every read.
