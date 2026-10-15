import { RESUME_VERSION, type Resume } from '@/types/resume'

/**
 * The starter resume new users see, and what "Reset" restores.
 * Covers every default section so each one has an example to edit.
 */
export const sampleResume: Resume = {
  version: RESUME_VERSION,
  profile: {
    name: 'Jonny',
    title: 'AI Engineer',
    icon: '',
    links: [
      { id: 'nav-work', label: 'My work', href: 'https://github.com/' },
      { id: 'nav-notes', label: 'Notes', href: '#', icon: 'note' },
      { id: 'nav-prints', label: 'Prints', href: '#', icon: 'image' },
    ],
  },
  sections: [
    {
      id: 'about',
      kind: 'text',
      title: 'About',
      visible: true,
      body:
        'I build interfaces for data-heavy products: maps, ledgers, dashboards. I care about load time, keyboard access, and type that reads well at 14px.\n\nCurrently based in Lisbon, working with teams across Europe.',
    },
    {
      id: 'experience',
      kind: 'timeline',
      title: 'Experience',
      visible: true,
      items: [
        {
          id: 'exp-kestrel',
          title: 'Kestrel Maps',
          subtitle: 'Senior Frontend Engineer',
          href: '',
          start: '2024',
          end: '',
          current: true,
          summary: 'Lead the web team behind the route planner used by 41,000 field crews.',
          highlights: [],
        },
        {
          id: 'exp-orchard',
          title: 'Orchard Ledger',
          subtitle: 'Frontend Engineer',
          href: '',
          start: '2021',
          end: '2024',
          summary: 'Owned the invoicing workspace and the shared component library.',
          current: false,
          highlights: [
            'Designed and built the [pricing page](https://example.com), from concept to production',
            'Implemented server-side filtering for the main ledger table',
            'Cut dashboard load time from 4.1s to 1.7s',
          ],
        },
      ],
    },
    {
      id: 'projects',
      kind: 'timeline',
      title: 'Projects',
      visible: true,
      items: [
        {
          id: 'proj-tidewater',
          title: 'Tidewater',
          subtitle: '',
          href: 'https://github.com/',
          start: '2025',
          end: '',
          current: false,
          summary: 'A tide-chart app for sea swimmers, built to work offline.',
          highlights: ['Service worker caches 30 days of forecasts', 'Used weekly by 2,300 swimmers'],
        },
      ],
    },
    {
      id: 'education',
      kind: 'timeline',
      title: 'Education',
      visible: true,
      items: [
        {
          id: 'edu-lisbon',
          title: 'University of Lisbon',
          subtitle: 'M.Sc. Computer Science',
          href: '',
          start: '2019',
          end: '2021',
          current: false,
          summary: '',
          highlights: [],
        },
        {
          id: 'edu-porto',
          title: 'University of Porto',
          subtitle: 'B.Sc. Information Design',
          href: '',
          start: '2016',
          end: '2019',
          current: false,
          summary: '',
          highlights: [],
        },
      ],
    },
    {
      id: 'skills',
      kind: 'tags',
      title: 'Skills',
      visible: true,
      items: [
        { id: 'sk-lang', label: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'SQL'] },
        { id: 'sk-front', label: 'Frontend', items: ['React', 'Next.js', 'Tailwind CSS', 'WebGL', 'Accessibility'] },
        { id: 'sk-tools', label: 'Tools', items: ['Git', 'Figma', 'Vite', 'Vercel', 'Playwright'] },
      ],
    },
    {
      id: 'collaborations',
      kind: 'people',
      title: 'Collaborations',
      visible: true,
      intro: 'Some of the people I had the chance to work alongside and learn from',
      items: [
        { id: 'p-tomas', name: 'Tomás Ferreira', href: 'https://example.com', avatar: '' },
        { id: 'p-amara', name: 'Amara Lindqvist', href: '', avatar: '' },
        { id: 'p-yusuf', name: 'Yusuf Okafor', href: '', avatar: '' },
      ],
    },
    {
      id: 'connect',
      kind: 'links',
      title: 'Connect',
      visible: true,
      items: [
        { id: 'c-github', label: 'GitHub', href: 'https://github.com/' },
        { id: 'c-linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/' },
        { id: 'c-email', label: 'Email', href: 'mailto:ines@example.com' },
      ],
    },
  ],
  settings: { template: 'minimal', accent: '#ff4a00', lang: 'en' },
}
