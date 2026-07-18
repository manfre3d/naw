import { Component, ChangeDetectionStrategy, input, signal, computed, afterNextRender } from '@angular/core';
import { HeroSection } from '../models/descriptor.model';
import { MagneticHoverDirective } from '../directives/magnetic-hover.directive';
import { HeroPortrait3dComponent } from '../hero-portrait-3d/hero-portrait-3d.component';
import { gsap } from 'gsap';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [MagneticHoverDirective, HeroPortrait3dComponent],
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  subDescriptor = input.required<HeroSection>();
  displayedText = signal('');

  // The photo is a fallback: shown only when there's no 3D model configured or
  // the 3D portrait reports it can't render (reduced motion / no WebGL / load
  // error). It is never fetched or shown during a successful 3D render.
  private portraitFailed = signal(false);
  showPhoto = computed(() => this.portraitFailed() || !this.subDescriptor().portraitModelPath);
  onPortraitFallback(): void {
    this.portraitFailed.set(true);
  }

  nameWords = computed(() =>
    this.subDescriptor().primaryHeaderText.split(' ').map(word => word.split(''))
  );

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Reduced motion: show the first role statically — no looping type/delete (WCAG 2.2.2)
        this.displayedText.set(this.subDescriptor().typingPhrases?.[0] ?? '');
        return;
      }
      this.startTyping();
      this.animateName();
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
