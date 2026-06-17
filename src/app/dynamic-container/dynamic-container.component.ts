import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { DynamicSingleContainerComponent } from '../dynamic-single-container/dynamic-single-container.component';
import { DescriptorSection } from '../models/descriptor.model';

@Component({
  selector: 'app-dynamic-container',
  standalone: true,
  imports: [DynamicSingleContainerComponent],
  templateUrl: './dynamic-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './dynamic-container.component.scss'
})
export class DynamicContainerComponent {
  descriptor = input<DescriptorSection[]>([]);
}
