import { Component, ChangeDetectionStrategy, input, ElementRef, inject, afterNextRender } from '@angular/core';
import { ContactsSection } from '../models/descriptor.model';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [],
  templateUrl: './contacts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {
  subDescriptor = input.required<ContactsSection>();
  readonly particleCount = [0, 1, 2, 3, 4, 5];
  private readonly el = inject(ElementRef<HTMLElement>);

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.registerPlugin(ScrollTrigger);

      // Floating particles
      (Array.from(this.el.nativeElement.querySelectorAll('.float-particle')) as HTMLElement[]).forEach((p: HTMLElement, i: number) => {
        gsap.to(p, {
          y: -(18 + i * 7),
          x: (i % 2 === 0 ? 1 : -1) * (12 + i * 3),
          duration: 2.2 + i * 0.35,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.28
        });
      });

      // Social icons staggered flip-in
      gsap.fromTo(
        this.el.nativeElement.querySelectorAll('.contacts-socials .social-icon'),
        { rotateY: 90, opacity: 0 },
        {
          rotateY: 0, opacity: 1,
          duration: 0.5, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: this.el.nativeElement, start: 'top 80%' }
        }
      );
    });
  }
}
