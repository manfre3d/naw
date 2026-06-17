import { Component, Input } from '@angular/core';
import { ProjectsSection } from '../models/descriptor.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  @Input() subDescriptor!: ProjectsSection;
}
