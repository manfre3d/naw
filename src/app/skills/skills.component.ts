import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { SkillsSection } from '../models/descriptor.model';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [],
  templateUrl: './skills.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './skills.component.scss'
})
export class SkillsComponent {
  subDescriptor = input.required<SkillsSection>();
}
