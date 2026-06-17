import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dynamic-card',
  standalone: true,
  imports: [],
  templateUrl: './dynamic-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dynamic-card.component.scss'
})
export class DynamicCardComponent {
  @Input() cardContent:any;
}
