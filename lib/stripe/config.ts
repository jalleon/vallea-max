// Server-side only - DO NOT import in client components
import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

/**
 * Get or create Stripe instance
 * Throws error if STRIPE_SECRET_KEY is not set
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// Re-export client-safe types and constants
export { STRIPE_PLANS, type PlanType } from './client-config'
