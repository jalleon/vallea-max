import { NextResponse } from 'next/server'
import { getStripe, STRIPE_PLANS, PlanType } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: Request) {
  try {
    const { planType, userId } = await request.json()

    if (!planType || !STRIPE_PLANS[planType as PlanType]) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    const plan = STRIPE_PLANS[planType as PlanType]

    if (!plan.priceId) {
      return NextResponse.json(
        { error: 'Plan price ID not configured' },
        { status: 500 }
      )
    }

    // Get Stripe instance
    const stripe = getStripe()

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/dashboard?payment=success`,
      cancel_url: `${request.headers.get('origin')}/pricing?payment=cancelled`,
      // Enable automatic tax calculation
      automatic_tax: {
        enabled: true,
      },
      // Collect billing address for tax calculation
      billing_address_collection: 'required',
      metadata: {
        userId,
        planType,
      },
      client_reference_id: userId,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
