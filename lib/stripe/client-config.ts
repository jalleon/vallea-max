// Client-side Stripe configuration (safe for browser)
export const STRIPE_PLANS = {
  monthly: {
    name: 'Monthly',
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '',
    price: 100,
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
    price: 80,
    displayPrice: 960,
    currency: 'CAD',
    interval: 'year' as const,
    savings: 240,
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
