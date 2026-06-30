import { Component, ChangeDetectionStrategy, computed, effect, inject, afterNextRender } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { gsap } from 'gsap';
import { DynamicContainerComponent } from './dynamic-container/dynamic-container.component';
import { DescriptorSection } from './models/descriptor.model';
import { LanguageService } from './services/language.service';
import descriptorEn from '../descriptor.en.json';
import descriptorIt from '../descriptor.it.json';

const META = {
  en: {
    title:         'Manfredi Piraino — Software Engineer',
    description:   'Portfolio of Manfredi Piraino, Consultant Software Engineer at Blue Reply. Specialised in Angular, Spring Boot, cloud microservices, and enterprise-grade applications.',
    ogDescription: 'Consultant Software Engineer at Blue Reply. Angular, Spring Boot, cloud microservices, enterprise applications.',
    locale:        'en_GB',
  },
  it: {
    title:         'Manfredi Piraino — Software Engineer',
    description:   'Portfolio di Manfredi Piraino, Consultant Software Engineer in Blue Reply. Specializzato in Angular, Spring Boot, microservizi cloud e applicazioni enterprise.',
    ogDescription: 'Consultant Software Engineer in Blue Reply. Angular, Spring Boot, microservizi cloud, applicazioni enterprise.',
    locale:        'it_IT',
  },
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DynamicContainerComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private langService  = inject(LanguageService);
  private titleService = inject(Title);
  private metaService  = inject(Meta);
  private doc          = inject(DOCUMENT);

  siteStructure = computed<DescriptorSection[]>(() =>
    this.langService.currentLang() === 'en'
      ? descriptorEn.sections as unknown as DescriptorSection[]
      : descriptorIt.sections as unknown as DescriptorSection[]
  );

  constructor() {
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const glow = this.doc.querySelector<HTMLElement>('.cursor-glow');
      if (!glow) return;
      const moveX = gsap.quickTo(glow, 'x', { duration: 0.65, ease: 'power2.out' });
      const moveY = gsap.quickTo(glow, 'y', { duration: 0.65, ease: 'power2.out' });
      this.doc.addEventListener('mousemove', (e: MouseEvent) => {
        moveX(e.clientX - 350);
        moveY(e.clientY - 350);
      });
    });

    effect(() => {
      const lang = this.langService.currentLang();
      const m = META[lang];

      this.doc.documentElement.lang = lang;
      this.titleService.setTitle(m.title);
      this.metaService.updateTag({ name: 'description',         content: m.description });
      this.metaService.updateTag({ property: 'og:title',        content: m.title });
      this.metaService.updateTag({ property: 'og:description',  content: m.ogDescription });
      this.metaService.updateTag({ property: 'og:locale',       content: m.locale });
      this.metaService.updateTag({ name: 'twitter:title',       content: m.title });
      this.metaService.updateTag({ name: 'twitter:description', content: m.ogDescription });
    });
  }
}
