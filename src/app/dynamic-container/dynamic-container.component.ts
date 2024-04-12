import { Component, Input, OnInit } from '@angular/core';
import { DynamicSingleContainerComponent } from '../dynamic-single-container/dynamic-single-container.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dynamic-container',
  standalone: true,
  imports: [
    DynamicSingleContainerComponent,
    CommonModule
  ],
  templateUrl: './dynamic-container.component.html',
  styleUrl: './dynamic-container.component.scss'
})
export class DynamicContainerComponent implements OnInit{

  @Input() descriptor :any;
  ngOnInit(): void{
    console.log("DYNAMICA CONTAINER INIT");

    console.log(this.descriptor);
  }


}
