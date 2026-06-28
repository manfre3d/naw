import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Scroll-reveal. Each section registers itself via `observe()` when its own
 * view is ready, so reveal never depends on all sections being in the DOM at
 * the same moment (which is fragile under SSR hydration).
 */
@Injectable({ providedIn: 'root' })
export class ScrollAnimationService {
  private observer: IntersectionObserver | null = null;
  private configured = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  observe(el: Element | null | undefined): void {
    if (!el || !isPlatformBrowser(this.platformId)) return;

    this.configure();

    // Reduced motion / no IntersectionObserver support → just show it.
    if (!this.observer) {
      el.classList.add('show');
      return;
    }

    // Already on screen → reveal now; otherwise animate in when scrolled to.
    const rect = (el as HTMLElement).getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('show');
    } else {
      this.observer.observe(el);
    }
  }

  private configure(): void {
    if (this.configured) return;
    this.configured = true;

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    if (reduceMotion || !('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          obs.unobserve(entry.target); // reveal once, then stop
        }
      }
    });
  }
}
