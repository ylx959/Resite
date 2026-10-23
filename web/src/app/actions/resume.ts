'use server'

import { currentAccount } from '@/lib/auth'
import { saveDraft, type SaveDraftResult } from '@/lib/drafts'
import { createSupabase } from '@/lib/supabase'

/** Saves the signed-in user's progress. The argument is untrusted: `saveDraft` runs it through `parseResume`. */
export async function saveResumeAction(resume: unknown): Promise<SaveDraftResult> {
  const supabase = await createSupabase()
  const account = await currentAccount(supabase)
  if (!account) return { ok: false, error: 'You were signed out. Sign in again to keep saving to your account.' }
  return saveDraft(supabase, account.id, resume)
}
