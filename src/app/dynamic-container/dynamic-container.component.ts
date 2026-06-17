import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DynamicSingleContainerComponent } from '../dynamic-single-container/dynamic-single-container.component';
import { DescriptorSection } from '../models/descriptor.model';

@Component({
  selector: 'app-dynamic-container',
  standalone: true,
  imports: [DynamicSingleContainerComponent],
  templateUrl: './dynamic-container.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dynamic-container.component.scss'
})
export class DynamicContainerComponent {
  @Input() descriptor: DescriptorSection[] = [];
}
