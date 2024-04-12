import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeroComponent } from './hero/hero.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { DynamicContainerComponent } from './dynamic-container/dynamic-container.component';
import { CommonModule } from '@angular/common';

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
export class AppComponent {
  title = 'naw';
  testDescriptor : any = [
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
      style:"SECTION",
      elements:[
        {
          type:"CARD",
          style:''
        },
        {
          type:"CARD",
          style:''
        }
      ]
    },
    {
      type:"FOOTER",
      style:""
    },
  ];
}
