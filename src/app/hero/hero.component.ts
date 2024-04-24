import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, Input, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit, AfterViewInit{
  secondaryTextActive: boolean=false;

  @Input() subDescriptor:any;
  
  constructor(@Inject(DOCUMENT) private document: Document){}

  ngOnInit(): void{

  }
  ngAfterViewInit(): void{
    // js automation for dynamic text
    let welcomeTitle = this.document.getElementById("dynamic_introduction") as HTMLElement
    welcomeTitle.addEventListener("animationend", ()=>{
      welcomeTitle.classList.remove("typing-animation-primary");
      welcomeTitle.style.border="";
      this.secondaryTextActive=true;
    });

  }
  downloadPdf(){
    let link = document.createElement("a");
    link.download = "Manfredi_Piraino_CV.pdf";
    link.href="assets/cv_Manfredi_Piraino_2024.pdf";
    link.setAttribute("target","_blank");
    link.click();
  }
}
