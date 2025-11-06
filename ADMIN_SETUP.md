# Admin Dashboard Setup - Valea Max

## Complete Secure Admin System with Best Practices ✅

### What Was Implemented:

1. **Database Schema**
   - Added `is_admin` column to `profiles` table
   - Created admin check function `is_admin_user()`
   - Added performance index on `is_admin` column

2. **Row Level Security (RLS)**
   - ✅ Admins can view all profiles, users, and subscriptions
   - ✅ Regular users can only view their own data
   - ✅ Only admins can view waitlist and demo requests
   - ✅ Anyone can submit waitlist/demo requests (public forms)

3. **API Route Protection**
   - All `/api/admin/*` endpoints check authentication
   - Returns 401 if not logged in
   - Returns 403 if not admin
   - Proper error messages

4. **Frontend Protection**
   - Admin page redirects to login if not authenticated
   - Shows "Access Denied" screen if not admin
   - Clean UX with loading states

---

## Setup Instructions

### Step 1: Run the Admin Security Migration

Go to your Supabase SQL Editor and run:

```sql
-- Copy the entire contents of:
supabase/migrations/20251106180000_add_admin_policies.sql
```

This will:
- Add `is_admin` column to profiles
- Create proper RLS policies
- Add helper function

### Step 2: Make Yourself an Admin

**Option A: By Email (Recommended)**
```sql
-- First, view all users to find your email
SELECT id, email, full_name, is_admin FROM profiles ORDER BY created_at DESC;

-- Then set your email as admin (replace with your actual email)
UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';

-- Verify it worked
SELECT email, is_admin FROM profiles WHERE is_admin = true;
```

**Option B: By User ID**
```sql
UPDATE profiles SET is_admin = true WHERE id = 'your-user-id-here';
```

### Step 3: Log In and Access Admin Dashboard

1. Make sure you're logged in to Valea Max
2. Navigate to: **http://localhost:3001/fr/admin** (or `/en/admin`)
3. You should now see the admin dashboard with all data!

---

## Admin Dashboard Features

### Summary Cards
- Total registered users
- Total demo requests
- Total waitlist signups

### Users Tab
- Full name, email, organization
- Subscription status (Active, Trialing, Canceled, etc.)
- AI credits balance
- Registration date
- Subscription details (Stripe customer ID, price ID, etc.)

### Demo Requests Tab
- Name, email, company, phone
- Message from user
- Request date
- Language preference

### Waitlist Tab
- Name, email
- Language preference (FR/EN)
- Notification status
- Signup date

---

## Security Features Implemented

✅ **Authentication Required**: Must be logged in to access admin routes
✅ **Role-Based Access Control**: Only users with `is_admin = true` can access
✅ **Database-Level Security**: RLS policies enforce access at DB level
✅ **API Protection**: All admin endpoints verify authentication and role
✅ **Frontend Guards**: Admin page checks access before rendering
✅ **Clean Error Handling**: Proper 401/403 responses with helpful messages

---

## Adding More Admins

To give admin access to another user:

```sql
-- By email
UPDATE profiles SET is_admin = true WHERE email = 'another-user@example.com';

-- By user ID
UPDATE profiles SET is_admin = true WHERE id = 'user-id-here';
```

To remove admin access:

```sql
UPDATE profiles SET is_admin = false WHERE email = 'user@example.com';
```

---

## Production Considerations

Before deploying to production:

1. **Audit Logging**: Add logging for admin actions
2. **Rate Limiting**: Add rate limits to admin endpoints
3. **IP Whitelisting** (optional): Restrict admin access to specific IPs
4. **Two-Factor Authentication** (optional): Add 2FA for admin accounts
5. **Monitoring**: Set up alerts for admin access

---

## Troubleshooting

### "Unauthorized - Please log in"
- You're not logged in to Valea Max
- Go to `/login` and sign in first

### "Forbidden - Admin access required"
- Your account doesn't have admin privileges
- Run the SQL command from Step 2 to make yourself admin
- Make sure you're using the correct email

### "Failed to fetch admin data"
- Check that the migration was run successfully
- Verify RLS policies are active
- Check browser console for detailed error messages

---

## API Endpoints

All admin endpoints require authentication and admin role:

- `GET /api/admin/users` - Get all users with subscriptions
- `GET /api/admin/demo-requests` - Get all demo requests
- `GET /api/admin/waitlist` - Get all waitlist entries

---

## Database Tables Accessed

- `profiles` - User profiles and admin status
- `user_subscriptions` - Stripe subscription data
- `demo_requests` - Demo request submissions
- `waitlist` - Waitlist email signups

---

**Last Updated**: 2025-11-06
**Version**: 1.0
**Status**: Production Ready ✅
