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
    showIcon: true,
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
        'I have spent over four years studying machine learning and deep learning, developing strong proficiency in PyTorch and applying models to real-world industrial applications. I am passionate about building highly accurate models and optimizing workflows for greater efficiency.',
    },
    {
      id: 'experience',
      kind: 'timeline',
      title: 'Experience',
      visible: true,
      items: [
        {
          id: 'exp-forgeline',
          title: 'Forgeline Robotics',
          subtitle: 'AI Engineer',
          href: '',
          start: '2024',
          end: '',
          current: true,
          summary: 'Build the vision models that inspect welds and machined parts on 12 production lines.',
          highlights: [
            'Trained a PyTorch defect detector that reached 98.6% recall on surface cracks',
            'Cut inference latency from 180ms to 35ms with quantization and TensorRT',
            'Built the labelling-to-deployment pipeline that ships a retrained model every week',
          ],
        },
        {
          id: 'exp-meridian',
          title: 'Meridian Energy Lab',
          subtitle: 'Machine Learning Engineer',
          href: '',
          start: '2022',
          end: '2024',
          current: false,
          summary: 'Developed forecasting and anomaly-detection models for industrial sensor data.',
          highlights: [
            'Shipped a temporal model predicting turbine faults 48 hours ahead',
            'Reduced false alarms by 62% versus the rule-based system it replaced',
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
          id: 'proj-sparkcheck',
          title: 'SparkCheck',
          subtitle: '',
          href: 'https://github.com/',
          start: '2025',
          end: '',
          current: false,
          summary: 'An open-source toolkit for training and benchmarking industrial defect-detection models.',
          highlights: ['Plug-in PyTorch training loops with mixed precision', 'Starred by 1,200 developers on GitHub'],
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
          id: 'edu-msc',
          title: 'National Taiwan University',
          subtitle: 'M.Sc. Artificial Intelligence',
          href: '',
          start: '2020',
          end: '2022',
          current: false,
          summary: 'Thesis on lightweight convolutional networks for real-time visual inspection.',
          highlights: [],
        },
        {
          id: 'edu-bsc',
          title: 'National Tsing Hua University',
          subtitle: 'B.Sc. Computer Science',
          href: '',
          start: '2016',
          end: '2020',
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
        { id: 'sk-lang', label: 'Languages', items: ['Python', 'C++', 'SQL', 'CUDA'] },
        { id: 'sk-ml', label: 'Machine Learning', items: ['PyTorch', 'Computer Vision', 'Time Series', 'Transformers', 'scikit-learn'] },
        { id: 'sk-ops', label: 'MLOps', items: ['Docker', 'ONNX', 'TensorRT', 'MLflow', 'Git'] },
      ],
    },
    {
      id: 'collaborations',
      kind: 'people',
      title: 'Collaborations',
      visible: true,
      intro: 'Some of the people I had the chance to work alongside and learn from',
      items: [
        { id: 'p-mei', name: 'Mei Chen', href: 'https://example.com', avatar: '' },
        { id: 'p-daniel', name: 'Daniel Brooks', href: '', avatar: '' },
        { id: 'p-priya', name: 'Priya Raman', href: '', avatar: '' },
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
        { id: 'c-email', label: 'Email', href: 'mailto:jonny@example.com' },
      ],
    },
  ],
  settings: { template: 'minimal', accent: '#ff4a00', lang: 'en' },
}
