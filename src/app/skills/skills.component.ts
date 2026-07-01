import { Component, ChangeDetectionStrategy, input, ElementRef, inject, afterNextRender } from '@angular/core';
import { SkillsSection } from '../models/descriptor.model';
import { Tilt3dDirective } from '../directives/tilt-3d.directive';
import { MagneticHoverDirective } from '../directives/magnetic-hover.directive';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [Tilt3dDirective, MagneticHoverDirective],
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
        this.el.nativeElement.querySelectorAll('.skill-category'),
        { rotateX: 50, scale: 0.84, opacity: 0, y: 40 },
        { rotateX: 0, scale: 1, opacity: 1, y: 0, duration: 0.75, stagger: 0.1, ease: 'back.out(1.4)', scrollTrigger: trigger }
      );

      gsap.fromTo(
        this.el.nativeElement.querySelectorAll('.skill-tag'),
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, stagger: 0.012, ease: 'back.out(1.8)', scrollTrigger: trigger, delay: 0.12 }
      );
    });
  }

  onCardPointerMove(event: PointerEvent): void {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--x', `${event.clientX - rect.left}px`);
    card.style.setProperty('--y', `${event.clientY - rect.top}px`);
  }
}
