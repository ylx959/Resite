/**
 * The deployment guide, as data. Rendered as the in-app "Deploy" panel and
 * as the README.md inside every exported ZIP, so the two never drift apart.
 */
export type GuideStep = {
  title: string
  body: string
  /** Optional link the step points to. */
  link?: { label: string; href: string }
}

export const deploySteps: GuideStep[] = [
  {
    title: 'Download your website',
    body: 'Select "Download website" in Resite. You get resume-website.zip: a complete site with index.html, a stylesheet, a small script and your images. Resite also opens Vercel Drop in a new tab.',
  },
  {
    title: 'Extract the files (optional)',
    body: 'Double-click the ZIP to unpack it into a resume-website folder. Open index.html in your browser to check it. Vercel also accepts the ZIP as-is.',
  },
  {
    title: 'Create a free Vercel account',
    body: 'Sign up with your email or a GitHub, GitLab or Bitbucket account. The free Hobby plan is enough for a personal site.',
    link: { label: 'vercel.com/signup', href: 'https://vercel.com/signup' },
  },
  {
    title: 'Drop your site onto Vercel',
    body: 'Open Vercel Drop and drag in the ZIP or the resume-website folder. Choose a project name (it becomes part of your web address) and select Deploy. Nothing needs to be installed or built.',
    link: { label: 'vercel.com/drop', href: 'https://vercel.com/drop' },
  },
  {
    title: 'Share your public URL',
    body: 'When the deploy finishes, Vercel shows an address like your-name.vercel.app. That is your live resume. To update it later, export again and drop the new files the same way.',
  },
]

export const deployNotes: string[] = [
  'Resite never deploys anything for you. The site lives in your own Vercel account, and you control it.',
  'Prefer the command line? Run `npx vercel --prod` inside the extracted resume-website folder.',
  'Prefer Git? Push the folder to a GitHub repository and import it at vercel.com/new. Leave the framework preset as "Other" with no build command.',
]
