import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { HeaderSection } from '../models/descriptor.model';

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
}
