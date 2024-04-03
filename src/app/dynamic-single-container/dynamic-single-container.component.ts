import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dynamic-single-container',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './dynamic-single-container.component.html',
  styleUrl: './dynamic-single-container.component.scss'
})
export class DynamicSingleContainerComponent {

  @Input() section :any;
  // ngSwitchCase: any

  ngOnInit(): void{
    // console.log(this.section);
  }

}
