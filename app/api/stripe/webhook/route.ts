import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import { emailService } from '@/lib/email/mailjet'

// Lazy initialization - only create clients when webhook is actually called
let stripeClient: Stripe | null = null
let supabaseAdminClient: ReturnType<typeof createClient<Database>> | null = null

const getStripe = (): Stripe => {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  }
  return stripeClient
}

const getSupabaseAdmin = () => {
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  return supabaseAdminClient
}

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
    const stripe = getStripe()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

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

  const supabaseAdmin = getSupabaseAdmin()
  let userId = session.metadata?.userId || session.client_reference_id
  const isSignupFlow = session.metadata?.signupFlow === 'true'

  // If this is a signup flow, create the user account first
  if (isSignupFlow) {
    console.log('Signup flow detected - creating user account')

    const email = session.metadata?.email
    const fullName = session.metadata?.fullName
    const tempPassword = session.metadata?.tempPassword
    const locale = session.metadata?.locale || 'fr'
    const creditsAmount = parseInt(session.metadata?.creditsAmount || '0')

    if (!email || !tempPassword) {
      console.error('Missing email or password in signup metadata')
      throw new Error('Missing required signup information')
    }

    // Decode password (was base64 encoded)
    const password = atob(tempPassword)

    // Create user account via Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since they paid
      user_metadata: {
        full_name: fullName,
        locale,
      }
    })

    if (authError) {
      console.error('Error creating user account:', authError)
      throw authError
    }

    userId = authData.user.id
    console.log(`User account created: ${userId}`)

    // Add AI credits if purchased
    if (creditsAmount > 0) {
      const { error: creditsError } = await supabaseAdmin
        .from('users')
        .update({
          scan_credits_quota: creditsAmount,
          scan_credits_used: 0
        })
        .eq('id', userId)

      if (creditsError) {
        console.error('Error adding credits:', creditsError)
      } else {
        console.log(`Added ${creditsAmount} AI credits to user ${userId}`)
      }
    }
  }

  if (!userId) {
    console.error('No user ID found in checkout session')
    throw new Error('No user ID found')
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

  // Get user info for welcome email
  const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)

  if (user?.user) {
    const userEmail = user.user.email
    const userName = user.user.user_metadata?.full_name || userEmail?.split('@')[0] || 'User'
    const locale = user.user.user_metadata?.locale || 'fr'

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

  // Cast to any since Stripe SDK types may not include all webhook properties
  const sub: any = subscription

  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      status: sub.status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', sub.id)

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }

  console.log(`Subscription ${subscription.id} updated to status: ${subscription.status}`)
}

// Handle subscription deletion/cancellation
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deletion:', subscription.id)

  const supabaseAdmin = getSupabaseAdmin()
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

  // Cast to any since Invoice types may not include all properties
  const inv: any = invoice

  // Update subscription status to past_due
  if (inv.subscription) {
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', inv.subscription as string)

    if (error) {
      console.error('Error updating subscription status to past_due:', error)
    }
  }

  // TODO: Send payment failed notification email via Mailjet
  // await emailService.sendPaymentFailedEmail(userEmail, locale)
}
