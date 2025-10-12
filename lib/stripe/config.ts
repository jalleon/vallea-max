import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export const STRIPE_PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    price: 29,
    currency: 'CAD',
    interval: 'month',
    features: [
      'Up to 50 property inspections per month',
      'Basic reporting',
      'Email support',
      '1 user account'
    ]
  },
  professional: {
    name: 'Professional',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    price: 79,
    currency: 'CAD',
    interval: 'month',
    features: [
      'Unlimited property inspections',
      'Advanced reporting and analytics',
      'Priority email & phone support',
      'Up to 5 user accounts',
      'Custom branding',
      'Export to PDF/Excel'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    price: 199,
    currency: 'CAD',
    interval: 'month',
    features: [
      'Everything in Professional',
      'Unlimited users',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      '24/7 priority support'
    ]
  }
} as const

export type PlanType = keyof typeof STRIPE_PLANS
