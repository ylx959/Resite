import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server only. A Supabase client acting as the signed-in user, from this request's auth cookies.
 * Create one per request (Server Action or Route Handler); both can write cookies, so token refreshes are saved.
 * Row Level Security (`web/supabase/migrations/`) limits it to the user's own rows.
 */
export async function createSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in web/.env.local.')

  const store = await cookies()
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        for (const { name, value, options } of list) store.set(name, value, options)
      },
    },
  })
}

export type Supabase = Awaited<ReturnType<typeof createSupabase>>
