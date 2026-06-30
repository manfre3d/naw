import { Component, ChangeDetectionStrategy, input, ElementRef, inject, afterNextRender } from '@angular/core';
import { ExperienceSection } from '../models/descriptor.model';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [],
  templateUrl: './experience.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './experience.component.scss'
})
export class ExperienceComponent {
  subDescriptor = input.required<ExperienceSection>();
  private readonly el = inject(ElementRef<HTMLElement>);

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo(
        this.el.nativeElement.querySelectorAll('.employer-block'),
        { x: -80, rotateY: -18, opacity: 0, scale: 0.92 },
        {
          x: 0, rotateY: 0, opacity: 1, scale: 1,
          duration: 0.8, stagger: 0.16, ease: 'power4.out',
          scrollTrigger: { trigger: this.el.nativeElement, start: 'top 80%' }
        }
      );
    });
  }
}
