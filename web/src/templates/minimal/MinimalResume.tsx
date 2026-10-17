import type { CSSProperties, ReactNode } from 'react'
import type {
  Icon,
  Link,
  PeopleSection,
  Person,
  Resume,
  Section,
  TagsSection,
  TextSection,
  TimelineItem,
  TimelineSection,
} from '@/types/resume'
import { parseInline } from '@/utils/inline'
import { isExternal, safeHref, safeImageSrc } from '@/utils/url'
import { anchor, PARAGRAPH_BREAK } from '../anchors'
import { isShownLink, visibleSections } from '../content'
import { MARK_COLOR, MARK_VIEWBOX } from '../mark'

/**
 * The Minimal template: myResume's layout, driven by Resume data.
 * Pure — renders only from `resume` — so the same tree feeds the live preview
 * and `renderToStaticMarkup` in the export engine. All user text goes through
 * React (escaped) and every URL through `safeHref` / `safeImageSrc`.
 * `anchor(...)` marks what the editor can point at; the export strips them.
 */
export function MinimalResume({ resume }: { resume: Resume }) {
  const { profile, settings } = resume
  return (
    <div className="cv" id="top" style={{ '--accent': settings.accent } as CSSProperties}>
      <header className="cv-header" {...anchor('profile')}>
        <div className="cv-header-id">
          <div className="cv-name-row">
            <a className="cv-name" href="#top" {...anchor('name')}>
              {profile.name || 'Your name'}
            </a>
            {profile.showIcon && <Mark icon={profile.icon} />}
          </div>
          {profile.title && (
            <p className="cv-title" {...anchor('title')}>
              {profile.title}
            </p>
          )}
        </div>
        <LinkRow as="nav" className="cv-nav" links={profile.links} label="Primary" anchored />
      </header>
      <main className="cv-main">
        {visibleSections(resume).map((section) => (
          <section
            key={section.id}
            className={`cv-section cv-section--${section.kind}`}
            aria-labelledby={`s-${section.id}`}
            {...anchor.section(section.id)}
          >
            {section.title && (
              <h2 className="cv-h2" id={`s-${section.id}`} {...anchor('title')}>
                {section.title}
              </h2>
            )}
            <SectionBody section={section} />
          </section>
        ))}
      </main>
    </div>
  )
}

function SectionBody({ section }: { section: Section }) {
  switch (section.kind) {
    case 'text':
      return <Prose section={section} />
    case 'timeline':
      return <Timeline section={section} />
    case 'tags':
      return <Tags section={section} />
    case 'people':
      return <People section={section} />
    case 'links':
      return <LinkRow className="cv-links" links={section.items} />
  }
}

function Prose({ section }: { section: TextSection }) {
  return (
    <div className="cv-prose" {...anchor('body')}>
      {/* Same paragraphs as `paragraphs()`, keyed by their index in the source so the editor's caret can point at one. */}
      {section.body.split(PARAGRAPH_BREAK).map((p, i) =>
        p.trim() ? (
          <p key={i} {...anchor(i)}>
            <Inline text={p.trim()} />
          </p>
        ) : null,
      )}
    </div>
  )
}

function Timeline({ section }: { section: TimelineSection }) {
  return (
    <ul>
      {section.items.map((item) => (
        <li key={item.id} className="cv-entry" {...anchor.item(item.id)}>
          <article>
            <div className="cv-entry-head">
              <h3 className="cv-entry-title" {...anchor('title')}>
                {safeHref(item.href) ? <TextLink label={item.title} href={item.href} /> : item.title}
              </h3>
              <Period {...item} />
            </div>
            {item.subtitle && (
              <p className="cv-entry-subtitle" {...anchor('subtitle')}>
                {item.subtitle}
              </p>
            )}
            {item.summary && (
              <p className="cv-entry-summary" {...anchor('summary')}>
                <Inline text={item.summary} />
              </p>
            )}
            {item.highlights.some((h) => h.trim()) && (
              <ul className="cv-highlights" {...anchor('highlights')}>
                {/* Keyed by line number in the editor's textarea, blank lines included. */}
                {item.highlights.map((h, i) =>
                  h.trim() ? (
                    <li key={i} {...anchor(i)}>
                      <Inline text={h} />
                    </li>
                  ) : null,
                )}
              </ul>
            )}
          </article>
        </li>
      ))}
    </ul>
  )
}

/** "2024", "2021 – 2024", or "2024 – Present". */
function Period({ start, end, current }: TimelineItem) {
  const to = current ? 'Present' : end.trim()
  if (!start.trim() && !to) return null
  return (
    <p className="cv-period" {...anchor('period')}>
      {start.trim()}
      {start.trim() && to && ' – '}
      {to}
    </p>
  )
}

function Tags({ section }: { section: TagsSection }) {
  return (
    <dl className="cv-tags">
      {section.items.map((group) => (
        <div key={group.id} className="cv-tag-row" {...anchor.item(group.id)}>
          <dt className="cv-tag-label" {...anchor('label')}>
            {group.label}
          </dt>
          <dd {...anchor('items')}>
            <ul className="cv-tag-list">
              {group.items.map((tag, i) => (
                <li key={i} className="cv-tag">
                  {tag}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  )
}

function People({ section }: { section: PeopleSection }) {
  return (
    <>
      {section.intro.trim() && (
        <p {...anchor('intro')}>
          <Inline text={section.intro} />
        </p>
      )}
      {section.items.length > 0 && (
        <ul className="cv-people">
          {section.items.map((person) => (
            <li key={person.id} {...anchor.item(person.id)}>
              <PersonChip person={person} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

/** A linked chip when the person has a safe `href`, otherwise a plain one. */
function PersonChip({ person }: { person: Person }) {
  const href = safeHref(person.href)
  const content = (
    <>
      <Avatar person={person} />
      <span>{person.name}</span>
    </>
  )
  return href ? (
    <a className="cv-chip" {...linkAttrs(href)}>
      {content}
    </a>
  ) : (
    <span className="cv-chip">{content}</span>
  )
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

function Avatar({ person }: { person: Person }) {
  const src = safeImageSrc(person.avatar)
  return src ? (
    <img className="cv-avatar" src={src} alt="" width={20} height={20} loading="lazy" />
  ) : (
    <span className="cv-avatar cv-initials" aria-hidden="true">
      {initials(person.name)}
    </span>
  )
}

function LinkRow({
  links,
  className,
  as: Tag = 'div',
  label,
  anchored = false,
}: {
  links: Link[]
  className: string
  as?: 'div' | 'nav'
  label?: string
  /** Header links sit under their own `links` anchor; a links section's items sit directly in the section. */
  anchored?: boolean
}) {
  const shown = links.filter(isShownLink)
  if (shown.length === 0) return null
  return (
    <Tag className={className} aria-label={label} {...(anchored && anchor('links'))}>
      {shown.map((link) => (
        <TextLink key={link.id} {...link} edit={link.id} />
      ))}
    </Tag>
  )
}

/** Plain text with `[label](url)` links. Links with unsafe URLs render as their label only. */
function Inline({ text }: { text: string }) {
  return parseInline(text).map((segment, i) =>
    'href' in segment && safeHref(segment.href) ? (
      <TextLink key={i} label={segment.text} href={segment.href} />
    ) : (
      segment.text
    ),
  )
}

const linkAttrs = (href: string) =>
  isExternal(href) ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href }

const icons: Record<Icon, ReactNode> = {
  arrow: <path d="M12 10V4m0 0H6m6 0l-7.833 7.833" />,
  note: (
    <path d="m8.833 4.167 1.89-1.89c.521-.522 1.365-.522 1.886 0l1.114 1.114c.521.52.521 1.364 0 1.885l-1.89 1.89m-3-3-6.61 6.61c-.25.25-.39.59-.39.943v2.448h2.448c.353 0 .692-.14.943-.39l6.609-6.61m-3-3 3 3" />
  ),
  image: (
    <>
      <path
        strokeLinecap="butt"
        d="M11 13.667 6.278 8.943a1.333 1.333 0 0 0-1.886 0L2.334 11m2 2.667h7.333a2 2 0 0 0 2-2V4.333a2 2 0 0 0-2-2H4.334a2 2 0 0 0-2 2v7.334a2 2 0 0 0 2 2Z"
      />
      <path
        strokeLinecap="square"
        strokeWidth={0.8}
        d="m9.111 5.778.556-1.111.555 1.11 1.111.556-1.11.556L9.666 8 9.11 6.889 8 6.333z"
      />
    </>
  ),
}

/** Underlined text link with a trailing icon (default arrow). Renders plain text if `href` is unsafe. */
function TextLink({ label, href, icon = 'arrow', edit }: Pick<Link, 'label' | 'href' | 'icon'> & { edit?: string }) {
  const safe = safeHref(href)
  if (!safe) return <>{label}</>
  return (
    <a className={`cv-link${icon === 'arrow' ? '' : ' cv-link--wide'}`} {...linkAttrs(safe)} {...(edit && anchor.item(edit))}>
      {label}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {icons[icon]}
      </svg>
    </a>
  )
}

/** The site icon beside the name (also the favicon): the user's image, else the default mark. Decorative. */
function Mark({ icon }: { icon: string }) {
  const src = safeImageSrc(icon)
  if (src) return <img className="cv-mark" src={src} alt="" {...anchor('icon')} />
  return (
    <svg className="cv-mark" viewBox={MARK_VIEWBOX} aria-hidden="true" {...anchor('icon')}>
      <rect width="38" height="40" rx="19" fill="white" />
      <circle cx="19" cy="20" r="17" fill={MARK_COLOR} />
    </svg>
  )
}
