import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Get the locale from cookies (set by next-intl middleware) or default to 'fr'
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr'

  // URL to redirect to after sign in process completes (with locale prefix)
  return NextResponse.redirect(`${requestUrl.origin}/${locale}/dashboard`)
}
