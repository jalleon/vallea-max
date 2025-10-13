# Stripe Setup Guide for Valea Max

## Step 1: Create Your Product and Prices in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** → **Add product**
3. Fill in the product details:
   - **Name**: Valea Max Subscription
   - **Description**: Professional real estate appraisal platform
   - **Upload image**: (optional) Add your Valea Max logo

4. **Create Monthly Price**:
   - Click **Add another price**
   - Set price: **$100.00 CAD**
   - Billing period: **Monthly**
   - Price description: "Monthly subscription"
   - Click **Save product**
   - Copy the Price ID (starts with `price_`)

5. **Create Yearly Price**:
   - In the same product, click **Add another price**
   - Set price: **$960.00 CAD**
   - Billing period: **Yearly**
   - Price description: "Annual subscription (save $240/year)"
   - Click **Add price**
   - Copy the Price ID (starts with `price_`)

## Step 2: Get Your Publishable Key

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Under **Standard keys**, find **Publishable key**
3. It should start with `pk_live_...`
4. Click to reveal and copy it

## Step 3: Fill in .env.local

Replace the placeholders with your actual values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xrqhkocktxzzyfwixqgg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Stripe
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_YOUR_MONTHLY_PRICE_ID_HERE
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_YOUR_YEARLY_PRICE_ID_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
NEXT_PUBLIC_SITE_URL=https://www.valeamax.com
```

## Step 4: Set Up Webhook (After Deployment)

You'll need to do this after deploying your checkout endpoint:

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://www.valeamax.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Click to reveal the **Signing secret** (starts with `whsec_`)
7. Update your `.env.local` with this webhook secret

## Step 5: Add to Vercel Environment Variables

Once you have all values, add them to Vercel:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add each variable from above
3. Select **Production**, **Preview**, and **Development** environments
4. Redeploy your site

## Testing

Before going live, you can test with Stripe test mode:
- Use test keys (`sk_test_...` and `pk_test_...`)
- Create test prices
- Use test card: `4242 4242 4242 4242` with any future expiry and CVC

## Notes

- Keep your secret keys secure (never commit to git)
- The webhook secret is different for each endpoint
- If you regenerate any keys, update them everywhere (Vercel, local)
