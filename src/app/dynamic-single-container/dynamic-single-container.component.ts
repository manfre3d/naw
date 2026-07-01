import { AfterViewInit, Component, ChangeDetectionStrategy, ElementRef, inject, input, computed } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { ProjectsComponent } from '../projects/projects.component';
import { SkillsComponent } from '../skills/skills.component';
import { ExperienceComponent } from '../experience/experience.component';
import { EducationComponent } from '../education/education.component';
import {
  DescriptorSection, HeaderSection, HeroSection, SkillsSection,
  ExperienceSection, EducationSection, ProjectsSection, ContactsSection, FooterSection
} from '../models/descriptor.model';
import { ScrollAnimationService } from '../services/scroll-animation.service';
import { ActiveSectionService } from '../services/active-section.service';

@Component({
  selector: 'app-dynamic-single-container',
  standalone: true,
  imports: [
    HeroComponent,
    FooterComponent,
    HeaderComponent,
    ContactsComponent,
    ProjectsComponent,
    SkillsComponent,
    ExperienceComponent,
    EducationComponent,
  ],
  templateUrl: './dynamic-single-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './dynamic-single-container.component.scss',
})
export class DynamicSingleContainerComponent implements AfterViewInit {
  section = input.required<DescriptorSection>();

  sectionLabel = computed(() => {
    const t = this.section().type;
    return t.charAt(0) + t.slice(1).toLowerCase();
  });

  private scrollAnimation = inject(ScrollAnimationService);
  private activeSection = inject(ActiveSectionService);
  private host = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    // Each container reveals its own section once it's rendered — robust to
    // SSR-hydration timing differences between sections.
    const sectionEl = this.host.nativeElement.querySelector('section');
    this.scrollAnimation.observe(sectionEl);
    this.activeSection.observe(sectionEl, this.section().type);
  }

  asHeader(s: DescriptorSection) { return s as HeaderSection; }
  asHero(s: DescriptorSection) { return s as HeroSection; }
  asSkills(s: DescriptorSection) { return s as SkillsSection; }
  asExperience(s: DescriptorSection) { return s as ExperienceSection; }
  asEducation(s: DescriptorSection) { return s as EducationSection; }
  asProjects(s: DescriptorSection) { return s as ProjectsSection; }
  asContacts(s: DescriptorSection) { return s as ContactsSection; }
  asFooter(s: DescriptorSection) { return s as FooterSection; }
}
