import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { HeaderSection } from '../models/descriptor.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() subDescriptor!: HeaderSection;
}
