import type { TemplateId } from '@/types/resume'
import { MinimalResume } from './minimal/MinimalResume'
import { minimalCss } from './minimal/styles'
import { siteScript } from './siteScript'
import type { Template } from './types'

export type { Template } from './types'

const templates: Record<TemplateId, Template> = {
  minimal: { id: 'minimal', name: 'Minimal', Component: MinimalResume, css: minimalCss, script: siteScript },
}

export const getTemplate = (id: TemplateId): Template => templates[id]
