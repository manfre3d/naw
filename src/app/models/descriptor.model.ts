export interface LinkElement {
  link: string;
  icon: string;
  color: string;
  label: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface NavItem {
  description: string;
  link: string;
}

// --- Hero ---
export interface HeroSection {
  id: string;
  type: 'HERO';
  style: string;
  imgPath: string;
  primaryHeaderText: string;
  bio: string;
  availableForWork: boolean;
  availableBadge: string;
  cvPath: string;
  ctaDownload: string;
  ctaContact: string;
  scrollCueLabel: string;
  typingPhrases: string[];
  linkElements: LinkElement[];
  stats?: HeroStat[];
}

// --- Skills ---
export interface Skill {
  name: string;
  icon?: string;
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

export interface SkillsSection {
  id: string;
  type: 'SKILLS';
  style: string;
  label: string;
  title: string;
  categories: SkillCategory[];
}

// --- Experience ---
export interface ExperienceProject {
  client: string;
  name: string;
  img?: string;
  description: string;
}

export interface ExperienceElement {
  img?: string;
  company: string;
  role: string;
  period: string;
  current?: boolean;
  projects: ExperienceProject[];
}

export interface ExperienceSection {
  id: string;
  type: 'EXPERIENCE';
  style: string;
  label: string;
  title: string;
  currentLabel: string;
  elements: ExperienceElement[];
}

// --- Education ---
export interface EducationElement {
  img: string;
  institution: string;
  degree: string;
  period: string;
  location: string;
  description: string;
}

export interface EducationSection {
  id: string;
  type: 'EDUCATION';
  style: string;
  label: string;
  title: string;
  elements: EducationElement[];
}

// --- Projects ---
export interface ProjectElement {
  img: string;
  name: string;
  description: string;
  link?: string;
  liveUrl?: string;
  tags?: string[];
  status?: string;
  logoCard?: boolean;
}

export interface ProjectsSection {
  id: string;
  type: 'PROJECTS';
  style: string;
  label: string;
  title: string;
  linkLabel: string;
  elements: ProjectElement[];
}

// --- Contacts ---
export interface ContactsSection {
  id: string;
  type: 'CONTACTS';
  style: string;
  label: string;
  mail: string;
  primaryTitleText: string;
  secondaryTitleText: string;
  replyPromise?: string;
  linkElements?: LinkElement[];
}

// --- Header ---
export interface HeaderSection {
  id: string;
  type: 'HEADER';
  animation: boolean;
  style?: string;
  nav: { navigationList: NavItem[] };
}

// --- Footer ---
export interface FooterSection {
  id: string;
  type: 'FOOTER';
  style: string;
  footerText: string;
  linkElements: LinkElement[];
}

export type DescriptorSection =
  | HeaderSection
  | HeroSection
  | SkillsSection
  | ExperienceSection
  | EducationSection
  | ProjectsSection
  | ContactsSection
  | FooterSection;
