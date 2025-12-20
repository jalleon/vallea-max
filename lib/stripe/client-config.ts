// Client-side Stripe configuration (safe for browser)

// Subscription Plans (Required to access platform)
export const STRIPE_PLANS = {
  monthly: {
    name: 'Monthly',
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '',
    price: 99,
    currency: 'CAD',
    interval: 'month' as const,
    features: [
      'Unlimited property inspections',
      'Advanced reporting and analytics',
      'Priority email & phone support',
      'Multiple user accounts',
      'Custom branding',
      'Export to PDF/Excel',
      'Mobile app access',
      'Cloud storage'
    ]
  },
  annual: {
    name: 'Annual',
    priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || '',
    price: 79,
    displayPrice: 948, // 79 * 12
    currency: 'CAD',
    interval: 'year' as const,
    savings: 240, // Save $240/year vs monthly (99*12 - 948)
    features: [
      'Everything in Monthly',
      'Save $240/year (20% discount)',
      'Priority support',
      'Early access to new features',
      'Dedicated account manager',
      'Custom integrations available',
      'Annual invoice',
      'Guaranteed pricing for 12 months'
    ]
  }
}

export type PlanType = keyof typeof STRIPE_PLANS

// AI Credits Bundles (Optional add-on)
export const CREDITS_BUNDLES = {
  starter: {
    name: 'Starter',
    credits: 500,
    price: 5,
    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_500_PRICE_ID || '',
    currency: 'CAD',
    popular: false
  },
  standard: {
    name: 'Standard',
    credits: 1000,
    price: 10,
    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_1000_PRICE_ID || '',
    currency: 'CAD',
    popular: true
  },
  pro: {
    name: 'Pro',
    credits: 2000,
    price: 18,
    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_2000_PRICE_ID || '',
    currency: 'CAD',
    savings: 2, // Save $2 vs buying 2x 1000-credit bundles
    popular: false
  }
}

export type CreditsBundleType = keyof typeof CREDITS_BUNDLES
