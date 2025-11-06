import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/server'
import { emailService } from '@/lib/email/mailjet'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email, fullName, organizationName, tempPassword, locale } = await request.json()

    // Validation
    if (!email || !fullName || !tempPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = createRouteClient()

    // Check if email already exists in auth.users
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Delete any existing pending verifications for this email
    await supabase
      .from('email_verifications')
      .delete()
      .eq('email', email)
      .eq('verified', false)

    // Generate unique verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Set expiration to 30 minutes from now
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30)

    // Store in email_verifications table
    const { error: insertError } = await supabase
      .from('email_verifications')
      .insert({
        email,
        full_name: fullName,
        organization_name: organizationName || null,
        temp_password: tempPassword,
        verification_token: verificationToken,
        locale: locale || 'fr',
        expires_at: expiresAt.toISOString(),
        verified: false,
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create verification record' },
        { status: 500 }
      )
    }

    // Build verification link
    const baseUrl = request.headers.get('origin') || 'http://localhost:3001'
    const verificationLink = `${baseUrl}/${locale}/verify-email?token=${verificationToken}`

    // Send verification email via Mailjet
    try {
      await emailService.sendEmailVerification(
        email,
        fullName,
        verificationLink,
        locale || 'fr'
      )
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Delete the verification record if email fails
      await supabase
        .from('email_verifications')
        .delete()
        .eq('verification_token', verificationToken)

      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
    })
  } catch (error: any) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
