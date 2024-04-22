import { Component, OnInit } from '@angular/core';
import { DynamicContainerComponent } from './dynamic-container/dynamic-container.component';
import { RouterOutlet } from '@angular/router';
import descriptor from '../descriptor.json'
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SharedModule,
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
