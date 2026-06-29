import { inject, Injectable, PLATFORM_ID, signal, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private doc        = inject(DOCUMENT);

  currentTheme = signal<Theme>(this.resolveInitialTheme());

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      if (!isPlatformBrowser(this.platformId)) return;
      this.doc.documentElement.setAttribute('data-theme', theme);
      this.doc.querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', theme === 'dark' ? '#0D0D1A' : '#FAFAF8');
      localStorage.setItem('theme', theme);
    });
  }

  toggle(): void {
    this.currentTheme.update(t => (t === 'light' ? 'dark' : 'light'));
  }

  private resolveInitialTheme(): Theme {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
}
