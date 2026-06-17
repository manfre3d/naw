import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { DynamicContainerComponent } from './dynamic-container/dynamic-container.component';
import { DescriptorSection } from './models/descriptor.model';
import { LanguageService } from './services/language.service';
import descriptorEn from '../descriptor.en.json';
import descriptorIt from '../descriptor.it.json';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DynamicContainerComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private langService = inject(LanguageService);

  siteStructure = computed<DescriptorSection[]>(() =>
    this.langService.currentLang() === 'en'
      ? descriptorEn.sections as unknown as DescriptorSection[]
      : descriptorIt.sections as unknown as DescriptorSection[]
  );
}
