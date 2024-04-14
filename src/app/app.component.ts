import { Component, OnInit } from '@angular/core';
import { DynamicContainerComponent } from './dynamic-container/dynamic-container.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import descriptor from '../descriptor.json'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    DynamicContainerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  ngOnInit(): void {
    //console.log(descriptor)
  }
  title = 'naw';
  siteStructure : any = descriptor.sections;
  // [
  //   {
  //     type:"HEADER",
  //     style:""
  //   },
  //   {
  //     type:"HERO",
  //     style:"SECTION"
  //   },
    
  //   // {
  //   //   type:"ABOUT",
  //   //   style:"SECTION",
  //   //   elements:[
  //   //     {
  //   //       type:"CARD",
  //   //       style:''
  //   //     },
  //   //     {
  //   //       type:"CARD",
  //   //       style:''
  //   //     }
  //   //   ]
  //   // },
  //   // {
  //   //   type:"FOOTER",
  //   //   style:""
  //   // },
  // ];
}
