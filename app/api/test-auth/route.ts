import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()

    const supabase = createRouteClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    return NextResponse.json({
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message,
      cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      supabaseCookies: allCookies.filter(c =>
        c.name.includes('supabase') ||
        c.name.includes('sb-') ||
        c.name.includes('auth')
      )
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
