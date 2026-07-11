import { Component, ChangeDetectionStrategy, input, ElementRef, inject, afterNextRender } from '@angular/core';
import { SkillsSection } from '../models/descriptor.model';
import { SpotlightDirective } from '../directives/spotlight.directive';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [SpotlightDirective],
  templateUrl: './skills.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './skills.component.scss'
})
export class SkillsComponent {
  subDescriptor = input.required<SkillsSection>();
  private readonly el = inject(ElementRef<HTMLElement>);

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.registerPlugin(ScrollTrigger);

      const trigger = { trigger: this.el.nativeElement, start: 'top 82%' };

      gsap.fromTo(
        this.el.nativeElement.querySelectorAll('.core-card'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', scrollTrigger: trigger }
      );

      gsap.fromTo(
        this.el.nativeElement.querySelectorAll('.stack-row'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out', scrollTrigger: trigger, delay: 0.25 }
      );
    });
  }
}
