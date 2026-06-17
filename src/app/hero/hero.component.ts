import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { HeroSection } from '../models/descriptor.model';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgClass],
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  @Input() subDescriptor!: HeroSection;
}
