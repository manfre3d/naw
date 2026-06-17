import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ScrollAnimationService {
  private initialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  init(): void {
    if (this.initialized || !isPlatformBrowser(this.platformId)) return;
    if (!('IntersectionObserver' in window)) return;

    this.initialized = true;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('show', entry.isIntersecting);
      });
    });

    document.querySelectorAll('.hidden').forEach((el) => observer.observe(el));
  }
}
