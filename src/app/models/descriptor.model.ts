export interface LinkElement {
  link: string;
  icon: string;
  color: string;
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
  typingPhrases: string[];
  linkElements: LinkElement[];
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
  title: string;
  categories: SkillCategory[];
}

// --- Experience ---
export interface ExperienceElement {
  img: string;
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
}

export interface ExperienceSection {
  id: string;
  type: 'EXPERIENCE';
  style: string;
  title: string;
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
  title: string;
  elements: EducationElement[];
}

// --- Projects ---
export interface ProjectElement {
  img: string;
  name: string;
  description: string;
  link: string;
}

export interface ProjectsSection {
  id: string;
  type: 'PROJECTS';
  style: string;
  elements: ProjectElement[];
}

// --- Contacts ---
export interface ContactsSection {
  id: string;
  type: 'CONTACTS';
  style: string;
  mail: string;
  primaryTitleText: string;
  secondaryTitleText: string;
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
