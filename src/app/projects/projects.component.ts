import { Component, ChangeDetectionStrategy, input, ElementRef, inject, afterNextRender } from '@angular/core';
import { ProjectsSection } from '../models/descriptor.model';
import { Tilt3dDirective } from '../directives/tilt-3d.directive';
import { SpotlightDirective } from '../directives/spotlight.directive';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [Tilt3dDirective, SpotlightDirective],
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

      // Magnetic effect on demo buttons — matches the hero CTA behaviour
      (Array.from(this.el.nativeElement.querySelectorAll('.project-link--demo')) as HTMLElement[]).forEach(btn => {
        btn.addEventListener('mousemove', (e: MouseEvent) => {
          const r = btn.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width  / 2);
          const dy = e.clientY - (r.top  + r.height / 2);
          gsap.to(btn, { x: dx * 0.3, y: dy * 0.3, duration: 0.25, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
        });
      });
    });
  }
}
