import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { createRouteClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteClient()

    // Find the verification record
    const { data: verification, error: fetchError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('verification_token', token)
      .single() as any

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (verification.verified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 409 }
      )
    }

    // Check if expired
    const now = new Date()
    const expiresAt = new Date(verification.expires_at)
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 410 }
      )
    }

    // Mark as verified
    const updateData = {
      verified: true,
      verified_at: new Date().toISOString(),
    }
    const { error: updateError } = await supabase.from('email_verifications').update(updateData).eq('verification_token', token)

    if (updateError) {
      console.error('Update verification error:', updateError)
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      )
    }

    // Return success with user data for checkout
    return NextResponse.json({
      success: true,
      email: verification.email,
      fullName: verification.full_name,
      organizationName: verification.organization_name,
      tempPassword: verification.temp_password,
      locale: verification.locale,
    })
  } catch (error: any) {
    console.error('Verify email error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
