import { Component, ChangeDetectionStrategy, computed, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { DynamicContainerComponent } from './dynamic-container/dynamic-container.component';
import { DescriptorSection } from './models/descriptor.model';
import { LanguageService } from './services/language.service';
import descriptorEn from '../descriptor.en.json';
import descriptorIt from '../descriptor.it.json';

const META = {
  en: {
    title:         'Tahiana Olivia — Digital Communication & International Cooperation',
    description:   'Portfolio of Tahiana Olivia Rakotonjanahary, Digital Communication & Social Media professional specialised in International Cooperation for Development.',
    ogDescription: 'Digital Communication & Social Media | International Cooperation for Development. Based in Turin, Italy.',
    locale:        'en_GB',
  },
  it: {
    title:         'Tahiana Olivia — Comunicazione Digitale & Cooperazione Internazionale',
    description:   'Portfolio di Tahiana Olivia Rakotonjanahary, professionista in Comunicazione Digitale e Social Media specializzata in Cooperazione Internazionale per lo Sviluppo.',
    ogDescription: 'Comunicazione Digitale & Social Media | Cooperazione Internazionale per lo Sviluppo. Torino, Italia.',
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

  siteStructure = computed<DescriptorSection[]>(() => {
    const d: any = this.langService.currentLang() === 'en' ? descriptorEn : descriptorIt;
    return [d.header, d.hero, d.about, d.skills, d.experience, d.education, d.contacts, d.footer];
  });

  constructor() {
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
