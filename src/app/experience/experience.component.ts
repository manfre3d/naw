import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ExperienceSection } from '../models/descriptor.model';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [],
  templateUrl: './experience.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './experience.component.scss'
})
export class ExperienceComponent {
  subDescriptor = input.required<ExperienceSection>();
}
