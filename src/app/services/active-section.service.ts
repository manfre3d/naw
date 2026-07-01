import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DescriptorSection } from '../models/descriptor.model';

type SectionType = DescriptorSection['type'];

/**
 * Ongoing "which section currently dominates the viewport" tracker — distinct
 * from ScrollAnimationService, which reveals an element once and unobserves.
 * Consumed by SceneBackgroundComponent to drive per-section visual params.
 */
@Injectable({ providedIn: 'root' })
export class ActiveSectionService {
  readonly activeSection = signal<SectionType>('HERO');

  private observer: IntersectionObserver | null = null;
  private configured = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  observe(el: Element | null | undefined, type: SectionType): void {
    if (!el || !isPlatformBrowser(this.platformId)) return;

    this.configure();
    if (!this.observer) return;

    (el as HTMLElement).dataset['sectionType'] = type;
    this.observer.observe(el);
  }

  private configure(): void {
    if (this.configured) return;
    this.configured = true;

    if (!('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (!visible.length) return;

        const top = visible.reduce((a, b) => (b.intersectionRatio > a.intersectionRatio ? b : a));
        const type = (top.target as HTMLElement).dataset['sectionType'] as SectionType | undefined;
        if (type) this.activeSection.set(type);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
  }
}
