import { Component, ChangeDetectionStrategy, input, ElementRef, inject, afterNextRender } from '@angular/core';
import { ProjectsSection } from '../models/descriptor.model';
import { Tilt3dDirective } from '../directives/tilt-3d.directive';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [Tilt3dDirective],
  templateUrl: './projects.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  subDescriptor = input.required<ProjectsSection>();
  private readonly el = inject(ElementRef<HTMLElement>);

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.registerPlugin(ScrollTrigger);
      (Array.from(this.el.nativeElement.querySelectorAll('.project-card')) as HTMLElement[]).forEach((card: HTMLElement) => {
        gsap.fromTo(
          card,
          { rotateX: 30, y: 70, opacity: 0, scale: 0.92 },
          {
            rotateX: 0, y: 0, opacity: 1, scale: 1,
            duration: 0.85, ease: 'power4.out',
            scrollTrigger: { trigger: card, start: 'top 88%' }
          }
        );
      });
    });
  }
}
