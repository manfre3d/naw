import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, AfterViewInit{
  dynamicText: any;
  @Input() subDescriptor:any;
  
  constructor(@Inject(DOCUMENT) private document: Document){}

  ngOnInit(): void{

  }
  ngAfterViewInit(): void{
    // js automation for dynamic text
    let welcomeTitle = this.document.getElementById("dynamic_introduction") as HTMLElement
    welcomeTitle.addEventListener("animationend", ()=>{
      welcomeTitle.classList.remove("typing-animation");
      welcomeTitle.style.border="";
    });

  }

}
