import { currentAccount } from '@/lib/auth'
import { loadDraft } from '@/lib/drafts'
import { createSupabase } from '@/lib/supabase'
import type { AccountInfo } from '@/types/account'
import type { Resume } from '@/types/resume'

export type ResumeResponse = { account: AccountInfo | null; resume: Resume | null; updatedAt: string | null }

/** Who is signed in, and their last saved progress. Guests get `account: null`. */
export async function GET() {
  const supabase = await createSupabase()
  const account = await currentAccount(supabase)
  const draft = account ? await loadDraft(supabase, account.id) : null
  const body: ResumeResponse = {
    account: account && { email: account.email, username: account.username },
    resume: draft?.resume ?? null,
    updatedAt: draft?.updatedAt ?? null,
  }
  return Response.json(body, { headers: { 'Cache-Control': 'private, no-store' } })
}
