import type { ComponentType } from 'react'
import type { Resume, TemplateId } from '@/types/resume'

/**
 * A resume design. To add one: write a component and a stylesheet, then register it in `index.ts`.
 * The preview and the export engine only ever see this shape.
 */
export type Template = {
  id: TemplateId
  name: string
  /** Page content for `resume`. Must be pure: the same tree is rendered live and to static HTML. */
  Component: ComponentType<{ resume: Resume }>
  /** Becomes `assets/style.css`; also injected into the preview frame. Plain CSS, no build step. */
  css: string
  /** Becomes `assets/script.js`, loaded in `<head>`; also injected into the preview frame. */
  script: string
}
