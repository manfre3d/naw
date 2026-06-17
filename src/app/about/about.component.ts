import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { AboutSection } from '../models/descriptor.model';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass],
})
export class AboutComponent {
  @Input() subDescriptor!: AboutSection;
}
