export interface LinkElement {
  link: string;
  icon: string;
  color: string;
}

export interface NavItem {
  description: string;
  link: string;
}

export interface CardContent {
  img: string;
  title: string;
  subtitle: string;
  location: string;
  description: string;
}

export interface CardElement {
  type: 'CARD';
  content: CardContent;
}

export interface ProjectElement {
  img: string;
  name: string;
  description: string;
  link: string;
}

export interface HeaderSection {
  id: string;
  type: 'HEADER';
  animation: boolean;
  style?: string;
  nav: { navigationList: NavItem[] };
}

export interface HeroSection {
  id: string;
  type: 'HERO';
  style: string;
  imgPath: string;
  primaryHeaderText: string;
  secondaryHeaderText: string;
  linkElements: LinkElement[];
}

export interface AboutSection {
  id: string;
  type: 'ABOUT';
  style: string;
  imgPath: string;
  elements: CardElement[];
}

export interface ProjectsSection {
  id: string;
  type: 'PROJECTS';
  style: string;
  imgPath: string;
  elements: ProjectElement[];
}

export interface ContactsSection {
  id: string;
  type: 'CONTACTS';
  style: string;
  mail: string;
  primaryTitleText: string;
  secondaryTitleText: string;
}

export interface FooterSection {
  id: string;
  type: 'FOOTER';
  style: string;
  linkElements: LinkElement[];
}

export type DescriptorSection =
  | HeaderSection
  | HeroSection
  | AboutSection
  | ProjectsSection
  | ContactsSection
  | FooterSection;
