import { inject, Injectable, PLATFORM_ID, signal, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Lang = 'en' | 'it';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private platformId = inject(PLATFORM_ID);

  currentLang = signal<Lang>(this.resolveInitialLang());

  setLang(lang: Lang): void {
    this.currentLang.set(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
    }
  }

  private resolveInitialLang(): Lang {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('lang') as Lang | null;
      if (saved === 'en' || saved === 'it') return saved;
      return navigator.language.startsWith('it') ? 'it' : 'en';
    }
    return 'en';
  }
}
