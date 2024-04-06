import { Component } from '@angular/core';
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
export class DynamicContainerComponent {
  testDescription : any = [
    {
      type:"HEADER",
      style:""
    },
    {
      type:"HERO",
      style:"SECTION"
    },
    {
      type:"ABOUT",
      style:""
    },
    {
      type:"FOOTER",
      style:""
    },
  ];
  ngOnInit(): void{
    // console.log(this.testDescription);
  }


}
