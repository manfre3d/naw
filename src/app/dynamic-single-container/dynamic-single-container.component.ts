import { AfterViewInit, Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
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

  private scrollAnimation = inject(ScrollAnimationService);

  ngAfterViewInit(): void {
    this.scrollAnimation.init();
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
