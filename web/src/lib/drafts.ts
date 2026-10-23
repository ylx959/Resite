import type { Resume } from '@/types/resume'
import { parseResume } from '@/utils/validation'
import type { Supabase } from './supabase'

/** Server only. Each account's latest Resume: one `drafts` row per user, replaced on every save. */

export type Draft = { resume: Resume; updatedAt: string }
export type SaveDraftResult = { ok: true; updatedAt: string } | { ok: false; error: string }

/** Data-URL images make up most of a resume's size; this leaves room for a few. Matches `drafts_content_size` in web/supabase/migrations/. */
export const MAX_DRAFT_BYTES = 8 * 1024 * 1024

/** Checks untrusted input with `parseResume` and the size limit: the resume to store, or why not. */
export function prepareDraft(input: unknown): { ok: true; resume: Resume } | { ok: false; error: string } {
  const result = parseResume(input)
  if (!result.ok) return result
  if (Buffer.byteLength(JSON.stringify(result.resume)) > MAX_DRAFT_BYTES) {
    return { ok: false, error: 'This resume is too large to save. Try smaller images.' }
  }
  return result
}

export async function saveDraft(supabase: Supabase, userId: string, input: unknown): Promise<SaveDraftResult> {
  const draft = prepareDraft(input)
  if (!draft.ok) return draft
  const updatedAt = new Date().toISOString()
  const { error } = await supabase.from('drafts').upsert({ user_id: userId, content: draft.resume, updated_at: updatedAt })
  return error ? { ok: false, error: 'Could not save to your account. Your edits are kept in this browser.' } : { ok: true, updatedAt }
}

/** The user's saved draft, or `null` when there is none or it no longer validates. */
export async function loadDraft(supabase: Supabase, userId: string): Promise<Draft | null> {
  const { data } = await supabase
    .from('drafts')
    .select('content, updated_at')
    .eq('user_id', userId)
    .maybeSingle<{ content: unknown; updated_at: string }>()
  if (!data) return null
  const result = parseResume(data.content)
  return result.ok ? { resume: result.resume, updatedAt: data.updated_at } : null
}
