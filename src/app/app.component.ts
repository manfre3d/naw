import { Component } from '@angular/core';
import { DynamicContainerComponent } from './dynamic-container/dynamic-container.component';
import { DescriptorSection } from './models/descriptor.model';
import descriptor from '../descriptor.json';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DynamicContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  siteStructure: DescriptorSection[] = descriptor.sections as DescriptorSection[];
}
