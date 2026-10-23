import { NextResponse, type NextRequest } from 'next/server'
import { createSupabase } from '@/lib/supabase'

/** Where the sign-up confirmation email lands: trades the one-time `code` for a session cookie, then opens the editor. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const home = new URL('/', request.nextUrl.origin)
  if (code) {
    const supabase = await createSupabase()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(home)
  }
  home.searchParams.set('auth', 'failed')
  return NextResponse.redirect(home)
}
