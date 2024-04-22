import { Component, Input } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { AboutComponent } from '../about/about.component';
import { DynamicCardComponent } from '../dynamic-card/dynamic-card.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-dynamic-single-container',
  standalone: true,
  imports: [
    SharedModule,
    HeroComponent,
    FooterComponent,
    HeaderComponent,
    DynamicCardComponent,
    AboutComponent,
    ContactsComponent
  ],
  templateUrl: './dynamic-single-container.component.html',
  styleUrl: './dynamic-single-container.component.scss'
})
export class DynamicSingleContainerComponent {

  @Input() section :any;
  // ngSwitchCase: any

  ngOnInit(): void{
    // console.log(this.section);
    this.onScrollAnimationInit();
  }

  onScrollAnimationInit(){
    let observer = new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>{
        console.log(entry);
        if(entry.isIntersecting){
          entry.target.classList.add("show");
        }else{
          entry.target.classList.remove("show");
        }
      });
    });
    let hiddenElements = document.querySelectorAll(".hidden");
    hiddenElements.forEach((element)=> observer.observe(element));
  }

}
