import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { AboutComponent } from '../about/about.component';

@Component({
  selector: 'app-dynamic-single-container',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    FooterComponent,
    HeaderComponent,
    AboutComponent
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
