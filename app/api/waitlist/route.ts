import { NextResponse } from 'next/server'
import { emailService } from '@/lib/email/mailjet'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: Request) {
  try {
    const { email, name, locale } = await request.json()

    // Validate input
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Store waitlist entry in database
    const { error: dbError } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        locale: locale || 'fr',
        created_at: new Date().toISOString()
      })

    if (dbError) {
      // Check if email already exists (unique constraint violation)
      if (dbError.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already on the waitlist' },
          { status: 409 }
        )
      }

      console.error('Database error adding to waitlist:', dbError)
      return NextResponse.json(
        { error: 'Failed to add to waitlist' },
        { status: 500 }
      )
    }

    // Send confirmation email
    try {
      await emailService.addToWaitlist(email, name, locale || 'fr')
      console.log(`Waitlist confirmation email sent to ${email}`)
    } catch (emailError) {
      console.error('Failed to send waitlist email:', emailError)
      // Don't fail the request if email fails - the person is still on the waitlist
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully added to waitlist'
    })

  } catch (error: any) {
    console.error('Waitlist API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
