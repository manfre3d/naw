import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { FooterSection } from '../models/descriptor.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  subDescriptor = input.required<FooterSection>();
}
