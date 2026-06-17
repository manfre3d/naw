import { Component, ChangeDetectionStrategy } from '@angular/core';

// AboutComponent is no longer used — content split into ExperienceComponent and EducationComponent.
// Kept as an empty shell to avoid breaking any potential external references during migration.
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {}
