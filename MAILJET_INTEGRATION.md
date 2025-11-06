# Mailjet Email Service Integration - Valea Max

## Overview
This document describes the complete Mailjet email integration for Valea Max, including email verification, waitlist management, and transactional emails.

---

## ✅ What's Been Implemented

### 1. Mailjet Service Layer
**File**: `lib/email/mailjet.ts`

A complete email service with bilingual (FR/EN) support for:
- Welcome emails (sent after successful signup)
- Email verification (with 24-hour expiration)
- Password reset (with 1-hour expiration)
- Waitlist confirmation emails

All templates use:
- Professional HTML design with inline CSS
- Responsive layout
- Valea Max branding (colors, logo, gradients)
- Plain text fallbacks

### 2. Database Schema
**Migration**: `supabase/migrations/20251104000000_add_subscriptions_and_waitlist.sql`

Created `waitlist` table:
```sql
- id (UUID, primary key)
- email (TEXT, unique, required)
- name (TEXT, required)
- locale (TEXT, default 'fr', CHECK constraint for 'fr'/'en')
- created_at (TIMESTAMPTZ, auto-managed)
```

**RLS Policies**:
- Public (anon) can INSERT (for landing page form)
- Service role can SELECT (for admin access)

### 3. API Endpoints

#### Waitlist API
**File**: `app/api/waitlist/route.ts`

- **Method**: POST
- **Body**: `{ email, name, locale }`
- **Features**:
  - Input validation (email format, required fields)
  - Duplicate detection (409 status code)
  - Automatic confirmation email via Mailjet
  - Graceful error handling (email failure doesn't fail the request)

#### Email Verification API
**File**: `app/api/auth/verify-email/route.ts`

- **Method**: GET
- **Query params**: `?token=xxx&locale=fr`
- **Features**:
  - Token verification via Supabase Auth
  - Automatic redirect to success/error pages
  - Bilingual support

### 4. UI Components

#### WaitlistForm Component
**File**: `components/landing/WaitlistForm.tsx`

- Clean, modern design with MUI
- Form validation
- Loading states
- Success/error messaging
- Bilingual support (FR/EN)
- Integrated into landing page (`app/[locale]/page.tsx`)

### 5. Translations

#### French (`messages/fr.json`)
```json
"landing.waitlist": {
  "title": "Rejoignez la liste d'attente",
  "subtitle": "Soyez parmi les premiers à découvrir Valea Max",
  "namePlaceholder": "Votre nom complet",
  "emailPlaceholder": "votre@email.com",
  "submitButton": "Rejoindre la liste",
  "submitting": "Inscription en cours...",
  "success": "Merci! Nous vous contacterons bientôt.",
  "alreadyExists": "Cet e-mail est déjà sur la liste.",
  "error": "Une erreur est survenue. Veuillez réessayer."
}

"emailVerification": {
  "title": "Vérifiez votre e-mail",
  "subtitle": "Nous avons envoyé un lien de vérification...",
  // ... full verification flow translations
}
```

#### English (`messages/en.json`)
Complete English translations for all waitlist and email verification UI.

### 6. Environment Variables
**File**: `.env.local.template` (updated)

```bash
# Mailjet Configuration
MAILJET_API_KEY=your_mailjet_api_key_here
MAILJET_SECRET_KEY=your_mailjet_secret_key_here
MAILJET_FROM_EMAIL=noreply@valeamax.com
MAILJET_FROM_NAME=Valea Max
```

### 7. Integration with Stripe Webhook
**File**: `app/api/stripe/webhook/route.ts`

Welcome email is automatically sent when:
- User completes Stripe checkout (signup flow)
- Payment is successful
- User account is created

Email includes:
- Personalized greeting
- Feature overview
- Dashboard link
- Bilingual support (based on user's locale)

### 8. Documentation
**File**: `CLAUDE.md` (updated)

Added comprehensive Mailjet section covering:
- Configuration setup
- Environment variables
- Available email templates
- Usage examples
- Waitlist feature
- Integration points
- Best practices

---

## 🚀 Setup Instructions

### Step 1: Get Mailjet Credentials
1. Go to [Mailjet Dashboard](https://app.mailjet.com)
2. Navigate to: Account Settings → API Keys
3. Copy your API Key and Secret Key

### Step 2: Configure Environment Variables
Add these to your `.env.local` file:

```bash
MAILJET_API_KEY=your_actual_api_key
MAILJET_SECRET_KEY=your_actual_secret_key
MAILJET_FROM_EMAIL=noreply@valeamax.com
MAILJET_FROM_NAME=Valea Max
```

### Step 3: Verify Sender Email
In Mailjet Dashboard:
1. Go to Account Settings → Sender Addresses
2. Add and verify `noreply@valeamax.com`
3. Follow email verification process

### Step 4: Run Database Migration
The waitlist table should already be created via the migration. If not:

```bash
# Apply migration
npx supabase db push
```

### Step 5: Test the Integration

#### Test Waitlist Form
1. Navigate to landing page: `http://localhost:3001/fr`
2. Scroll to waitlist section
3. Submit form with valid email
4. Check email inbox for confirmation

#### Test Welcome Email
1. Complete signup flow with Stripe test card
2. Check email for welcome message

---

## 📧 Email Templates Overview

### 1. Welcome Email
**Function**: `emailService.sendWelcomeEmail(email, name, locale)`

**Sent when**: User completes signup and payment

**Contains**:
- Personalized greeting
- Feature list (Property Library, Inspections, AI Import, etc.)
- Call-to-action button (Go to Dashboard)
- Support information

### 2. Email Verification
**Function**: `emailService.sendVerificationEmail(email, name, link, locale)`

**Sent when**: User signs up (if verification is required)

**Contains**:
- Verification link (24-hour expiration)
- Clear instructions
- Security notice

**Note**: Currently not used in production (users auto-verified after Stripe payment)

### 3. Password Reset
**Function**: `emailService.sendPasswordResetEmail(email, link, locale)`

**Sent when**: User requests password reset

**Contains**:
- Reset link (1-hour expiration)
- Security warning
- Alternative link (in case button doesn't work)

### 4. Waitlist Confirmation
**Function**: `emailService.addToWaitlist(email, name, locale)`

**Sent when**: User joins waitlist from landing page

**Contains**:
- Thank you message
- Confirmation that they're on the list
- Branding

---

## 🔧 Usage Examples

### Send Welcome Email (Webhook)
```typescript
import { emailService } from '@/lib/email/mailjet'

// In Stripe webhook handler
const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
const locale = user.user.user_metadata?.locale || 'fr'

await emailService.sendWelcomeEmail(
  user.user.email!,
  user.user.user_metadata?.full_name || 'User',
  locale
)
```

### Add to Waitlist (API Route)
```typescript
import { emailService } from '@/lib/email/mailjet'

// In API route handler
const { email, name, locale } = await request.json()

// Store in database
await supabase.from('waitlist').insert({ email, name, locale })

// Send confirmation email
await emailService.addToWaitlist(email, name, locale)
```

### Send Password Reset
```typescript
import { emailService } from '@/lib/email/mailjet'

// Generate reset link
const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${token}`

// Send email
await emailService.sendPasswordResetEmail(
  userEmail,
  resetLink,
  userLocale
)
```

---

## 🎨 Design Guidelines

All email templates follow Valea Max brand guidelines:

### Colors
- **Primary gradient**: `linear-gradient(135deg, #10B981 0%, #059669 100%)`
- **Background**: `#F5F3EE`
- **Text dark**: `#1A1F36`
- **Text light**: `#4A5568`

### Layout
- **Max width**: 600px
- **Border radius**: 16px (cards), 8px (buttons)
- **Padding**: Consistent spacing (30-40px)
- **Shadows**: Subtle box-shadows for depth

### Typography
- **Headings**: System fonts, 700 weight
- **Body**: 16px, line-height 1.6
- **Links**: Primary green color

---

## 🔒 Security & Best Practices

1. **API Keys**: Never commit `.env.local` to Git
2. **Error handling**: Always catch email errors gracefully
3. **Rate limiting**: Consider adding rate limits to waitlist endpoint
4. **Email validation**: Validate email format on both client and server
5. **Locale fallback**: Always default to 'fr' if locale is missing
6. **Link expiration**: Verification (24h), Password reset (1h)
7. **RLS policies**: Strict database access control

---

## 📊 Monitoring & Logging

### Console Logs
- Email sent successfully: `Email sent successfully to ${email}`
- Welcome email: `Welcome email sent to ${email}`
- Waitlist: `Waitlist confirmation email sent to ${email}`
- Errors: `Mailjet send error:`, `Failed to send welcome email:`

### Mailjet Dashboard
Monitor email delivery rates, bounces, and complaints:
- Dashboard → Statistics
- Check delivery status
- Review bounce/complaint rates

---

## 🐛 Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify sender email in Mailjet dashboard
3. Check Mailjet logs for delivery status
4. Verify environment variables are set correctly

### API Errors
- **400**: Invalid email format or missing fields
- **409**: Email already exists in waitlist
- **500**: Mailjet API error (check credentials)

### Common Issues
- **CORS errors**: Make sure API routes are in `app/api/` directory
- **Missing translations**: Check `messages/fr.json` and `messages/en.json`
- **Database errors**: Verify migration ran successfully

---

## 📝 Future Enhancements

Potential improvements for future iterations:

1. **Email Templates**:
   - Payment receipt email
   - Subscription renewal reminder
   - Payment failed notification
   - Account cancellation confirmation

2. **Waitlist Features**:
   - Admin dashboard to view/manage waitlist
   - Export waitlist to CSV
   - Bulk email to waitlist members

3. **Email Preferences**:
   - User email preferences page
   - Unsubscribe functionality
   - Email notification settings

4. **Analytics**:
   - Track email open rates
   - Monitor click-through rates
   - A/B testing email templates

5. **Advanced Features**:
   - Email scheduling (send at specific time)
   - Drip campaigns for onboarding
   - Re-engagement emails for inactive users

---

## 📚 Resources

- [Mailjet Documentation](https://dev.mailjet.com/)
- [Mailjet Node.js SDK](https://github.com/mailjet/mailjet-apiv3-nodejs)
- [Valea Max CLAUDE.md](./CLAUDE.md) - Project guidelines
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

---

**Last Updated**: 2025-11-04
**Integration Status**: ✅ Complete and Production-Ready
**Version**: 1.0
