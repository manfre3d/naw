import { Component, ChangeDetectionStrategy, inject, input, signal, afterNextRender, viewChild, ElementRef, HostListener } from '@angular/core';
import { HeaderSection } from '../models/descriptor.model';
import { LanguageService } from '../services/language.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  subDescriptor   = input.required<HeaderSection>();
  langService     = inject(LanguageService);
  themeService    = inject(ThemeService);
  menuOpen        = signal(false);
  activeId = signal<string>('');

  private hamburgerBtn = viewChild<ElementRef<HTMLButtonElement>>('hamburgerBtn');

  constructor() {
    afterNextRender(() => this.trackActiveSection());
  }

  /** Close the mobile menu on Escape and return focus to the toggle button. */
  @HostListener('keydown.escape')
  closeMenuOnEscape(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.hamburgerBtn()?.nativeElement.focus();
  }

  isActive(link: string): boolean {
    return this.activeId() === link.replace('#', '');
  }

  /** Scroll-spy: highlight the nav entry whose section is currently in view. */
  private trackActiveSection(): void {
    if (!('IntersectionObserver' in window)) return;

    const targets = this.subDescriptor().nav.navigationList
      .map((item) => document.getElementById(item.link.replace('#', '')))
      .filter((el): el is HTMLElement => el !== null);

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.activeId.set(entry.target.id);
        }
      },
      // The "active" band sits just below the sticky header
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    targets.forEach((t) => observer.observe(t));
  }
}
