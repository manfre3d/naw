import { Component, ChangeDetectionStrategy, input, signal, computed, afterNextRender } from '@angular/core';
import { HeroSection } from '../models/descriptor.model';
import { MagneticHoverDirective } from '../directives/magnetic-hover.directive';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [MagneticHoverDirective],
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  subDescriptor = input.required<HeroSection>();
  displayedText = signal('');

  nameWords = computed(() =>
    this.subDescriptor().primaryHeaderText.split(' ').map(word => word.split(''))
  );

  constructor() {
    afterNextRender(() => {
      this.startTyping();
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.animateName();
        this.initParallax();
      }
    });
  }

  private animateName(): void {
    const chars = document.querySelectorAll<HTMLElement>('.hero-name-char');
    if (!chars.length) return;
    gsap.fromTo(
      chars,
      { rotateX: 90, opacity: 0, y: 20, transformOrigin: '50% 0%' },
      { rotateX: 0, opacity: 1, y: 0, duration: 0.6, stagger: 0.045, ease: 'back.out(1.5)', delay: 0.2 }
    );
  }

  private initParallax(): void {
    gsap.registerPlugin(ScrollTrigger);
    const frame = document.querySelector('.hero-photo-frame');
    if (!frame) return;
    gsap.to(frame, {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: { trigger: '.hero-wrapper', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  private startTyping(): void {
    const phrases = this.subDescriptor().typingPhrases;
    if (!phrases?.length) return;

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;

    const tick = () => {
      const current = phrases[phraseIdx];
      if (!deleting) {
        charIdx++;
        this.displayedText.set(current.slice(0, charIdx));
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(tick, 2200);
          return;
        }
      } else {
        charIdx--;
        this.displayedText.set(current.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? 45 : 80);
    };

    setTimeout(tick, 600);
  }
}
