import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ProjectsSection } from '../models/descriptor.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [],
  templateUrl: './projects.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  subDescriptor = input.required<ProjectsSection>();
}
