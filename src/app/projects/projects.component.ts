import { Component, ChangeDetectionStrategy, input, ElementRef, inject, afterNextRender, signal, computed, viewChild } from '@angular/core';
import { ProjectsSection } from '../models/descriptor.model';
import { SpotlightDirective } from '../directives/spotlight.directive';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [SpotlightDirective],
  templateUrl: './projects.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  subDescriptor = input.required<ProjectsSection>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly track = viewChild<ElementRef<HTMLUListElement>>('track');

  readonly pages = signal(1);
  readonly activePage = signal(0);
  readonly pageList = computed(() => Array.from({ length: this.pages() }, (_, i) => i));

  private stride = 0;
  private perView = 1;
  private reducedMotion = false;

  constructor() {
    afterNextRender(() => {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.measure();

      const trackEl = this.track()?.nativeElement;
      if (trackEl) {
        let ticking = false;
        trackEl.addEventListener('scroll', () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => { ticking = false; this.updateActive(); });
        }, { passive: true });
      }
      window.addEventListener('resize', () => this.measure(), { passive: true });

      if (this.reducedMotion) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo(
        this.el.nativeElement.querySelectorAll('.project-slide'),
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: this.el.nativeElement, start: 'top 82%' }
        }
      );
    });
  }

  prev(): void { this.scrollToPage(this.activePage() - 1); }
  next(): void { this.scrollToPage(this.activePage() + 1); }
  goTo(page: number): void { this.scrollToPage(page); }

  // Derive geometry from the rendered slides so pagination adapts to the
  // responsive items-per-view (3 desktop / 2 tablet / 1 mobile) with no hardcoding.
  private measure(): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    const slides = el.querySelectorAll<HTMLElement>('.project-slide');
    if (slides.length === 0) { this.pages.set(1); return; }
    this.stride = slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : slides[0].offsetWidth;
    this.perView = Math.max(1, Math.round(el.clientWidth / this.stride));
    this.pages.set(Math.max(1, Math.ceil(slides.length / this.perView)));
    this.updateActive();
  }

  private updateActive(): void {
    const el = this.track()?.nativeElement;
    if (!el || this.stride === 0) return;
    const page = Math.round(el.scrollLeft / (this.stride * this.perView));
    this.activePage.set(Math.min(Math.max(page, 0), this.pages() - 1));
  }

  private scrollToPage(page: number): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    const target = Math.max(0, Math.min(page, this.pages() - 1));
    el.scrollTo({ left: target * this.perView * this.stride, behavior: this.reducedMotion ? 'auto' : 'smooth' });
  }
}
