import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { HeaderSection } from '../models/descriptor.model';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  subDescriptor = input.required<HeaderSection>();
  langService = inject(LanguageService);
}
