# Stripe Integration Plan - Credit Purchase System

## Overview
Users can purchase scan credits through Stripe. Credits are added to their account automatically after successful payment.

## Current Setup (Already Implemented ✅)

### Database Schema
```sql
-- users table already has:
scan_credits_quota INTEGER DEFAULT 20
scan_credits_used INTEGER DEFAULT 0
scan_credits_reset_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 month')
```

### Credit Tracking
- ✅ Credits consumed automatically when scanning PDFs
- ✅ Atomic deduction via `consume_scan_credits()` function
- ✅ Usage logged in `usage_tracking` table
- ✅ Tiered pricing: 1 credit (<2MB), 2 credits (2-5MB), 4 credits (5+MB)

## What Needs to Be Added

### 1. Stripe Products & Prices
Create products in Stripe dashboard:
- 50 credits - $5 (one-time purchase)
- 200 credits - $18 (10% discount)
- 500 credits - $40 (20% discount)

### 2. Database Table for Purchase History
```sql
CREATE TABLE credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  credits_amount INTEGER NOT NULL,
  price_paid NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_credit_purchases_user ON credit_purchases(user_id, created_at DESC);
CREATE INDEX idx_credit_purchases_stripe ON credit_purchases(stripe_payment_intent_id);
```

### 3. Stripe Webhook Handler
```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle successful payment
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const userId = paymentIntent.metadata.user_id;
    const creditsAmount = parseInt(paymentIntent.metadata.credits_amount);

    // Add credits to user's quota
    const { error: updateError } = await supabase.rpc('add_credits_to_user', {
      p_user_id: userId,
      p_credits: creditsAmount
    });

    // Log purchase
    await supabase.from('credit_purchases').insert({
      user_id: userId,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: paymentIntent.customer as string,
      credits_amount: creditsAmount,
      price_paid: paymentIntent.amount / 100, // Convert cents to dollars
      currency: paymentIntent.currency,
      status: 'completed'
    });
  }

  // Handle refunds
  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge;
    // Deduct credits, update purchase status
  }

  return NextResponse.json({ received: true });
}
```

### 4. Database Function to Add Credits
```sql
CREATE OR REPLACE FUNCTION add_credits_to_user(
  p_user_id UUID,
  p_credits INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET scan_credits_quota = scan_credits_quota + p_credits
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$;
```

### 5. Frontend - Purchase Credits Page
```typescript
// app/[locale]/credits/page.tsx
'use client';

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PurchaseCreditsPage() {
  const handlePurchase = async (creditsAmount: number, priceId: string) => {
    const stripe = await stripePromise;

    // Create checkout session
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creditsAmount, priceId })
    });

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    await stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <Box>
      <Typography variant="h4">Purchase Scan Credits</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">50 Credits</Typography>
              <Typography variant="h3">$5</Typography>
              <Button onClick={() => handlePurchase(50, 'price_xxx')}>
                Purchase
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* More pricing tiers... */}
      </Grid>
    </Box>
  );
}
```

### 6. API Route - Create Checkout Session
```typescript
// app/api/stripe/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { creditsAmount, priceId } = await req.json();

  // Get authenticated user
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: req.headers.get('authorization')!
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      credits_amount: creditsAmount.toString(),
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits`,
  });

  return NextResponse.json({ sessionId: session.id });
}
```

## Implementation Steps

1. **Phase 1 - Setup Stripe**
   - Create Stripe account
   - Create products & prices
   - Get API keys
   - Add to `.env.local`

2. **Phase 2 - Database**
   - Run migration to create `credit_purchases` table
   - Add `add_credits_to_user()` function

3. **Phase 3 - Backend**
   - Create webhook handler (`/api/webhooks/stripe`)
   - Create checkout session API (`/api/stripe/create-checkout-session`)

4. **Phase 4 - Frontend**
   - Create purchase credits page
   - Add "Buy Credits" button to credit indicator
   - Show purchase history

5. **Phase 5 - Testing**
   - Test with Stripe test mode
   - Verify credits added after payment
   - Test refund flow

## Environment Variables Needed

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Estimated Development Time
- **Database setup**: 30 minutes
- **Stripe webhook**: 1-2 hours
- **Frontend UI**: 2-3 hours
- **Testing**: 1-2 hours

**Total**: ~6-8 hours of development

## Benefits of Current Architecture

✅ **Credits already tracked per user** (not per organization)
✅ **Atomic credit consumption** (no double-charging)
✅ **Usage tracking for analytics** (know who's using what)
✅ **Monthly reset option** (for subscription model later)
✅ **Easy to add Stripe** (just update one field)

## Alternative: Subscription Model

If you want recurring subscriptions instead of one-time purchases:

```sql
-- Add to users table
ALTER TABLE users
  ADD COLUMN stripe_subscription_id TEXT,
  ADD COLUMN subscription_plan TEXT CHECK (subscription_plan IN ('free', 'starter', 'pro', 'enterprise'));

-- Free: 20 credits/month
-- Starter: 100 credits/month ($10/mo)
-- Pro: 500 credits/month ($40/mo)
-- Enterprise: Unlimited credits ($100/mo)
```

Webhook handles `customer.subscription.updated` to reset credits monthly.

## Questions?

Let me know if you want help with:
- Setting up Stripe products
- Creating the migration files
- Building the frontend UI
- Testing the webhook flow
