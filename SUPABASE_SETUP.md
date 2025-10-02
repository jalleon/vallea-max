# Supabase Setup Guide (Updated 2024)

This guide uses the **new Supabase API key structure** (Publishable/Secret keys).

## 📋 Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Project Name**: `vallea-max` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is fine to start
5. Click **"Create new project"**
6. Wait ~2 minutes for provisioning

### 2. Get Your API Keys (New Method)

Once your project is ready:

1. Navigate to **Settings** (⚙️ gear icon in sidebar)
2. Click **API** in the Settings menu

#### In the "Configuration" section:
- Copy **URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
- Example: `https://abcdefghijklmnop.supabase.co`

#### In the "API Keys" section:
You'll see two types of keys:

**Publishable key** (formerly "anon key")
- ✅ Safe to use in browser code
- ✅ Works with Row Level Security (RLS)
- ✅ Use for client-side operations
- Copy this → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Secret keys** (formerly "service_role key")
- ⚠️ **NEVER expose in client-side code**
- ⚠️ Server-side only
- ⚠️ Click **"Reveal"** button to see it
- Copy this → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. **First**, copy and paste the entire contents of `lib/supabase/schema.sql`
4. Click **"Run"** (or press Ctrl/Cmd + Enter)
5. Wait for it to complete (you'll see "Success" message)
6. **Then**, create another new query
7. Copy and paste the entire contents of `lib/supabase/schema-updates.sql`
8. Click **"Run"**

### 5. Verify Setup

Check that tables were created:

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `organizations`
   - `users`
   - `properties`
   - `floor_areas`
   - `appraisals`
   - `comparables`
   - `field_history`
   - `activity_log`

### 6. Restart Development Server

```bash
# Stop your current server (Ctrl + C)
# Then restart:
npm run dev -- --port 4006
```

The new environment variables will be loaded.

## 🔐 Security Notes

### Key Differences (Old vs New):

| Old Name | New Name | Usage |
|----------|----------|-------|
| `anon` key | **Publishable** key | Client-side, browser-safe with RLS |
| `service_role` key | **Secret** key | Server-side only, full access |

### Important Security Rules:

1. ✅ **Publishable key** can be used in browser code
2. ❌ **Secret key** must NEVER be exposed to browser
3. ✅ `.env.local` is in `.gitignore` - won't be committed
4. ✅ Row Level Security (RLS) is enabled in schema
5. ✅ Policies control who can access what data

## 🧪 Testing Your Connection

After setup, you can test the connection:

```typescript
// In your browser console or a test file
import { supabase } from '@/lib/supabase/client'

// Test connection
const { data, error } = await supabase
  .from('properties')
  .select('count')

console.log('Connection test:', { data, error })
```

If successful, you should see the count (even if 0).

## 🚀 Next Steps

Once your Supabase is connected:

1. Update `features/library/_api/properties.service.ts` to use Supabase
2. Replace mock localStorage service with real database calls
3. Test CRUD operations
4. Import existing mock data to Supabase

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## ⚠️ Troubleshooting

### "Invalid API key" error
- Double-check you copied the **entire** key (they're very long)
- Make sure no extra spaces before/after the key
- Verify you're using the **Publishable** key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "relation does not exist" error
- Run `schema.sql` and `schema-updates.sql` in SQL Editor
- Check Table Editor to verify tables were created

### Changes not loading
- Restart your development server after updating `.env.local`
- Clear browser cache

---

*Last updated: 2024 - New API key structure*
