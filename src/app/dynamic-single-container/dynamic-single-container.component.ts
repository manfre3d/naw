import { AfterViewInit, Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { AboutComponent } from '../about/about.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { ProjectsComponent } from '../projects/projects.component';
import { DescriptorSection } from '../models/descriptor.model';
import { ScrollAnimationService } from '../services/scroll-animation.service';

@Component({
  selector: 'app-dynamic-single-container',
  standalone: true,
  imports: [
    HeroComponent,
    FooterComponent,
    HeaderComponent,
    AboutComponent,
    ContactsComponent,
    ProjectsComponent
  ],
  templateUrl: './dynamic-single-container.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dynamic-single-container.component.scss',
})
export class DynamicSingleContainerComponent implements AfterViewInit {
  @Input() section!: DescriptorSection;

  constructor(private scrollAnimation: ScrollAnimationService) {}

  ngAfterViewInit(): void {
    this.scrollAnimation.init();
  }
}
