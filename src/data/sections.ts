export type SectionId = 'about' | 'projects' | 'work-history' | 'contact' | 'compose';

export type Section = {
  id: SectionId;
  /** Route path, also used for deep links. */
  path: string;
  /** Desktop icon caption. */
  label: string;
  /** Window title bar text. */
  windowTitle: string;
  /** Status bar summary shown at the bottom of the window. */
  status: string;
};

export const sections: Section[] = [
  {
    id: 'about',
    path: '/about',
    label: 'About Me',
    windowTitle: 'About Me',
    status: 'Profile and skills'
  },
  {
    id: 'projects',
    path: '/projects',
    label: 'My Projects',
    windowTitle: 'My Projects',
    status: 'Selected work'
  },
  {
    id: 'work-history',
    path: '/work-history',
    label: 'Work History',
    windowTitle: 'Work History',
    status: 'Professional experience'
  },
  {
    id: 'contact',
    path: '/contact',
    label: 'Contact',
    windowTitle: 'Contact Me',
    status: 'Get in touch'
  },
  {
    id: 'compose',
    path: '/compose',
    label: 'Send Mail',
    windowTitle: 'New Message',
    status: 'Compose a message'
  }
];

export const sectionByPath = (path: string) => sections.find((s) => s.path === path);
