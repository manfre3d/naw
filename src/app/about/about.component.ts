import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { AboutSection } from '../models/descriptor.model';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  subDescriptor = input.required<AboutSection>();
}
