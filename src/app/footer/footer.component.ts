import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { FooterSection } from '../models/descriptor.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgClass],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  @Input() subDescriptor!: FooterSection;
}
