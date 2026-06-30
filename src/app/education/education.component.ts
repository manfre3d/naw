import { Component, ChangeDetectionStrategy, input, ElementRef, inject, afterNextRender } from '@angular/core';
import { EducationSection } from '../models/descriptor.model';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [],
  templateUrl: './education.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './education.component.scss'
})
export class EducationComponent {
  subDescriptor = input.required<EducationSection>();
  private readonly el = inject(ElementRef<HTMLElement>);

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo(
        this.el.nativeElement.querySelectorAll('.edu-card'),
        { rotateX: 40, scale: 0.88, opacity: 0, y: 36 },
        {
          rotateX: 0, scale: 1, opacity: 1, y: 0,
          duration: 0.7, stagger: 0.13, ease: 'back.out(1.3)',
          scrollTrigger: { trigger: this.el.nativeElement, start: 'top 82%' }
        }
      );
    });
  }
}
