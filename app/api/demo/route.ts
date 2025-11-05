import { NextResponse } from 'next/server'
import { emailService } from '@/lib/email/mailjet'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: Request) {
  try {
    const { email, name, company, phone, message, locale } = await request.json()

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

    // Store demo request in database
    const { error: dbError } = await supabase
      .from('demo_requests')
      .insert({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        company: company?.trim() || null,
        phone: phone?.trim() || null,
        message: message?.trim() || null,
        locale: locale || 'fr',
        created_at: new Date().toISOString()
      })

    if (dbError) {
      // Check if email already exists (unique constraint violation)
      if (dbError.code === '23505') {
        return NextResponse.json(
          { error: 'This email has already requested a demo' },
          { status: 409 }
        )
      }

      console.error('Database error adding demo request:', dbError)
      return NextResponse.json(
        { error: 'Failed to submit demo request' },
        { status: 500 }
      )
    }

    // Send confirmation email
    try {
      await emailService.sendDemoRequest(email, name, company, phone, message, locale || 'fr')
      console.log(`Demo request confirmation email sent to ${email}`)
    } catch (emailError) {
      console.error('Failed to send demo request email:', emailError)
      // Don't fail the request if email fails - the request is still recorded
    }

    return NextResponse.json({
      success: true,
      message: 'Demo request submitted successfully'
    })

  } catch (error: any) {
    console.error('Demo request API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
