import { NextResponse } from 'next/server'
import { getStripe, STRIPE_PLANS, PlanType } from '@/lib/stripe/config'
import { CREDITS_BUNDLES, CreditsBundleType } from '@/lib/stripe/client-config'

export async function POST(request: Request) {
  try {
    const { email, fullName, organizationName, tempPassword, planType, creditsBundle, locale } = await request.json()

    // Validation
    if (!email || !fullName || !tempPassword) {
      return NextResponse.json(
        { error: 'Missing required user information' },
        { status: 400 }
      )
    }

    if (!planType || !STRIPE_PLANS[planType as PlanType]) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      )
    }

    const plan = STRIPE_PLANS[planType as PlanType]

    if (!plan.priceId) {
      return NextResponse.json(
        { error: 'Subscription plan not configured' },
        { status: 500 }
      )
    }

    // Build line items
    const lineItems: any[] = [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ]

    // Add credits bundle if selected
    let creditsAmount = 0
    if (creditsBundle && CREDITS_BUNDLES[creditsBundle as CreditsBundleType]) {
      const bundle = CREDITS_BUNDLES[creditsBundle as CreditsBundleType]
      if (bundle.priceId) {
        lineItems.push({
          price: bundle.priceId,
          quantity: 1,
        })
        creditsAmount = bundle.credits
      }
    }

    // Get Stripe instance
    const stripe = getStripe()

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${request.headers.get('origin')}/${locale}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/${locale}/signup?payment=cancelled`,
      // Automatic tax disabled for test mode - enable after setting business address in Stripe dashboard
      // automatic_tax: {
      //   enabled: true,
      // },
      // Collect customer's billing address
      billing_address_collection: 'required',
      metadata: {
        signupFlow: 'true',
        email,
        fullName,
        organizationName: organizationName || '',
        tempPassword, // Will be used to create account after payment
        planType,
        creditsAmount: creditsAmount.toString(),
        locale,
      },
      subscription_data: {
        metadata: {
          email,
          fullName,
          organizationName: organizationName || '',
        },
      },
      customer_email: email,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Signup checkout error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
