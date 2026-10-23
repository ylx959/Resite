import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createSupabase } from '@/lib/supabase'

/**
 * Where the sign-up confirmation email lands: trades the link's one-time token for a session cookie, then opens the editor.
 * The email template links here with `token_hash` + `type`, which verifies in any browser. A PKCE `code` (Supabase's default
 * `{{ .ConfirmationURL }}`) only works in the browser that signed up, since its verifier lives in that browser's cookies.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const tokenHash = params.get('token_hash')
  const type = params.get('type') as EmailOtpType | null
  const code = params.get('code')
  const home = new URL('/', request.nextUrl.origin)

  if ((tokenHash && type) || code) {
    const supabase = await createSupabase()
    const { error } =
      tokenHash && type
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        : await supabase.auth.exchangeCodeForSession(code!)
    if (!error) return NextResponse.redirect(home)
  }
  home.searchParams.set('auth', 'failed')
  return NextResponse.redirect(home)
}
