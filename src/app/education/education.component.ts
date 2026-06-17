import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { EducationSection } from '../models/descriptor.model';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [],
  templateUrl: './education.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './education.component.scss'
})
export class EducationComponent {
  subDescriptor = input.required<EducationSection>();
}
