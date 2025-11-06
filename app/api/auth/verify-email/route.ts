import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Use service role for admin operations
const getSupabaseAdmin = () => {
  return createClient<Database>(
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const locale = searchParams.get('locale') || 'fr'

    if (!token) {
      return NextResponse.redirect(
        new URL(`/${locale}/auth/error?message=invalid_token`, request.url)
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Verify the token using Supabase Auth
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    })

    if (error || !data.user) {
      console.error('Email verification error:', error)
      return NextResponse.redirect(
        new URL(`/${locale}/auth/error?message=verification_failed`, request.url)
      )
    }

    console.log(`Email verified successfully for user: ${data.user.id}`)

    // Redirect to success page or dashboard
    return NextResponse.redirect(
      new URL(`/${locale}/auth/verified?success=true`, request.url)
    )

  } catch (error: any) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(
      new URL('/auth/error?message=server_error', request.url)
    )
  }
}
