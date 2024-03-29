import { Component } from '@angular/core';
import { DynamicSingleContainerComponent } from '../dynamic-single-container/dynamic-single-container.component';

@Component({
  selector: 'app-dynamic-container',
  standalone: true,
  imports: [DynamicSingleContainerComponent],
  templateUrl: './dynamic-container.component.html',
  styleUrl: './dynamic-container.component.scss'
})
export class DynamicContainerComponent {

}
