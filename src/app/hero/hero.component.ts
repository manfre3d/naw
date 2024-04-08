import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit{
  dynamicText: any;

  ngOnInit(): void{
    // js automation for dynamic text
    let test = document.getElementById("dynamic_introduction") as HTMLElement
    test.innerHTML = "test2";
    this.dynamicText="test";
  }
}
