'use client'

import { useDispatch } from '@/hooks/EditorContext'
import type { ListOp } from '@/resume/listOps'
import { createItem } from '@/resume/sectionKinds'
import { anchor, splitBy } from '@/templates/anchors'
import type {
  AnyItem,
  ItemOf,
  Link,
  LinksSection,
  ListSection,
  PeopleSection,
  Person,
  Section,
  TagGroup,
  TagsSection,
  TimelineItem,
  TimelineSection,
} from '@/types/resume'
import { fileToAvatar } from '@/utils/images'
import { Switch, TextAreaField, TextField } from '../ui/Field'
import { ImageIcon } from '../ui/icons'
import { ImageField } from './ImageField'
import { ItemList } from './ItemList'
import { LinkFields, urlError } from './LinkFields'
import { TagInput } from './TagInput'

const INLINE_HELP = 'Link words with [label](https://…). Leave a blank line between paragraphs.'

/** The kind-specific body of a section's editor. */
export function SectionContent({ section }: { section: Section }) {
  switch (section.kind) {
    case 'text':
      return <TextEditor id={section.id} body={section.body} />
    case 'timeline':
      return <TimelineEditor section={section} />
    case 'tags':
      return <TagsEditor section={section} />
    case 'people':
      return <PeopleEditor section={section} />
    case 'links':
      return <LinksEditor section={section} />
  }
}

/** `onOp` for one section's items, typed by the section it is given. */
function useItemOps<S extends ListSection>(section: S) {
  const dispatch = useDispatch()
  return (op: ListOp<ItemOf<S>>) => dispatch({ type: 'items', sectionId: section.id, op: op as ListOp<AnyItem> })
}

function TextEditor({ id, body }: { id: string; body: string }) {
  const dispatch = useDispatch()
  return (
    <TextAreaField
      label="Text"
      rows={5}
      value={body}
      onChange={(value) => dispatch({ type: 'section', id, patch: { body: value } })}
      helper={INLINE_HELP}
      placeholder="A few sentences about what you do and what you care about."
      {...anchor('body')}
      {...splitBy('paragraphs')}
    />
  )
}

function TimelineEditor({ section }: { section: TimelineSection }) {
  return (
    <ItemList<TimelineItem>
      items={section.items}
      noun="entry"
      onOp={useItemOps(section)}
      create={() => createItem('timeline')}
      describe={(item) => item.title}
      empty="No entries yet. Add a job, school or project."
      renderItem={(item, update) => (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField label="Title" value={item.title} onChange={(title) => update({ title })} placeholder="Company, school or project" {...anchor('title')} />
          <TextField label="Subtitle" value={item.subtitle} onChange={(subtitle) => update({ subtitle })} placeholder="Role or degree" {...anchor('subtitle')} />
          <TextField label="Start" value={item.start} onChange={(start) => update({ start })} placeholder="2022" {...anchor('period')} />
          <TextField
            label="End"
            value={item.current ? '' : item.end}
            onChange={(end) => update({ end })}
            placeholder={item.current ? 'Present' : 'Leave empty for one date'}
            disabled={item.current}
            {...anchor('period')}
          />
          <div className="sm:col-span-2">
            <Switch label="I'm here now" checked={item.current} onChange={(current) => update({ current })} />
          </div>
          <TextField
            label="Link"
            className="sm:col-span-2"
            value={item.href}
            onChange={(href) => update({ href })}
            placeholder="https://… (optional, links the title)"
            inputMode="url"
            error={urlError(item.href)}
            {...anchor('title')}
          />
          <TextAreaField
            label="Summary"
            className="sm:col-span-2"
            rows={2}
            value={item.summary}
            onChange={(summary) => update({ summary })}
            placeholder="One sentence on what you did."
            {...anchor('summary')}
          />
          <TextAreaField
            label="Highlights"
            className="sm:col-span-2"
            rows={3}
            value={item.highlights.join('\n')}
            onChange={(text) => update({ highlights: text.split('\n') })}
            helper="One per line. [label](https://…) makes a link."
            placeholder={'Press enter to add another list'}
            {...anchor('highlights')}
            {...splitBy('lines')}
          />
        </div>
      )}
    />
  )
}

function TagsEditor({ section }: { section: TagsSection }) {
  return (
    <ItemList<TagGroup>
      items={section.items}
      noun="group"
      onOp={useItemOps(section)}
      create={() => createItem('tags')}
      describe={(group) => group.label}
      empty="No groups yet. Add one, like Languages or Tools."
      renderItem={(group, update) => (
        <div className="flex flex-col gap-3">
          <TextField label="Group label" value={group.label} onChange={(label) => update({ label })} placeholder="Languages" {...anchor('label')} />
          <div {...anchor('items')}>
            <TagInput label="Tags" tags={group.items} onChange={(items) => update({ items })} />
          </div>
        </div>
      )}
    />
  )
}

function PeopleEditor({ section }: { section: PeopleSection }) {
  const dispatch = useDispatch()
  return (
    <div className="flex flex-col gap-4">
      <TextAreaField
        label="Intro"
        rows={2}
        value={section.intro}
        onChange={(intro) => dispatch({ type: 'section', id: section.id, patch: { intro } })}
        placeholder="People I've worked alongside and learned from"
        {...anchor('intro')}
      />
      <ItemList<Person>
        items={section.items}
        noun="person"
        onOp={useItemOps(section)}
        create={() => createItem('people')}
        describe={(person) => person.name}
        empty="No one here yet."
        renderItem={(person, update) => (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label="Name" value={person.name} onChange={(name) => update({ name })} placeholder="Full name" />
            <TextField
              label="Link"
              value={person.href}
              onChange={(href) => update({ href })}
              placeholder="https://… (optional)"
              inputMode="url"
              error={urlError(person.href)}
            />
            <ImageField
              label="Photo"
              value={person.avatar}
              onChange={(avatar) => update({ avatar })}
              process={fileToAvatar}
              placeholder={<ImageIcon />}
              round
              className="sm:col-span-2"
            />
          </div>
        )}
      />
    </div>
  )
}

function LinksEditor({ section }: { section: LinksSection }) {
  return (
    <ItemList<Link>
      items={section.items}
      noun="link"
      onOp={useItemOps(section)}
      create={() => createItem('links')}
      describe={(link) => link.label}
      empty="No links yet. Add your email, GitHub or LinkedIn."
      renderItem={(link, update) => <LinkFields link={link} update={update} />}
    />
  )
}
