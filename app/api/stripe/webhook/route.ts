import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import { emailService } from '@/lib/email/mailjet'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Create Supabase admin client (bypasses RLS) for webhook operations
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      )
    }

    console.log(`Received Stripe webhook event: ${event.type}`)

    // Handle different event types
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
          break

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
          break

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
          break

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
          break

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return NextResponse.json({ received: true })
    } catch (error: any) {
      console.error('Webhook handler error:', error)
      return NextResponse.json(
        { error: `Webhook handler failed: ${error.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: `Webhook processing failed: ${error.message}` },
      { status: 500 }
    )
  }
}

// Handle successful checkout session
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', session.id)

  const userId = session.metadata?.userId || session.client_reference_id

  if (!userId) {
    console.error('No user ID found in checkout session')
    return
  }

  const planType = session.metadata?.planType || 'monthly'

  // Create or update subscription record
  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      status: 'active',
      plan_type: planType,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('Error upserting subscription:', error)
    throw error
  }

  console.log(`Subscription created for user ${userId}`)

  // Fetch user details to send welcome email
  const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)

  if (user?.user) {
    const userEmail = user.user.email
    const userName = user.user.user_metadata?.full_name || userEmail?.split('@')[0] || 'User'
    const locale = user.user.user_metadata?.locale || 'fr' // Default to French

    try {
      await emailService.sendWelcomeEmail(userEmail!, userName, locale)
      console.log(`Welcome email sent to ${userEmail}`)
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      // Don't throw - email failure shouldn't fail the webhook
    }
  }
}

// Handle subscription updates
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('Processing subscription update:', subscription.id)

  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }

  console.log(`Subscription ${subscription.id} updated to status: ${subscription.status}`)
}

// Handle subscription deletion/cancellation
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deletion:', subscription.id)

  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error marking subscription as cancelled:', error)
    throw error
  }

  console.log(`Subscription ${subscription.id} cancelled`)

  // TODO: Send cancellation email via Mailjet
}

// Handle successful payment
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded for invoice:', invoice.id)

  // TODO: Send payment receipt email via Mailjet (custom template needed)
  // This would require creating a new email template in mailjet.ts
}

// Handle failed payment
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed for invoice:', invoice.id)

  // Update subscription status to past_due
  if (invoice.subscription) {
    const { error } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', invoice.subscription as string)

    if (error) {
      console.error('Error updating subscription status to past_due:', error)
    }
  }

  // TODO: Send payment failed notification email via Mailjet
  // await emailService.sendPaymentFailedEmail(userEmail, locale)
}
