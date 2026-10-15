import type { Resume } from '@/types/resume'
import { safeImageSrc } from '@/utils/url'
import type { Template } from './types'

/** Written by the export when the profile has no icon of its own. */
export const DEFAULT_ICON = 'assets/images/favicon.svg'

/**
 * The full `<html>` of an exported site: head metadata, the template's stylesheet
 * and script, and the template component as the body. Rendered only to static markup.
 */
export function SiteDocument({
  resume,
  template,
  title,
  description,
}: {
  resume: Resume
  template: Template
  title: string
  description: string
}) {
  const { Component } = template
  const icon = safeImageSrc(resume.profile.icon)
  return (
    <html lang={resume.settings.lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta name="theme-color" content="#fcfcfc" />
        {icon ? <link rel="icon" href={icon} /> : <link rel="icon" type="image/svg+xml" href={DEFAULT_ICON} />}
        <link rel="stylesheet" href="assets/style.css" />
        <script src="assets/script.js" />
      </head>
      <body>
        <Component resume={resume} />
      </body>
    </html>
  )
}
