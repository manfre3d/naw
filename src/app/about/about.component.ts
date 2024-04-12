import { Component, Input, OnInit } from '@angular/core';
import { DynamicContainerComponent } from '../dynamic-container/dynamic-container.component';
import { DynamicCardComponent } from "../dynamic-card/dynamic-card.component";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-about',
    standalone: true,
    templateUrl: './about.component.html',
    styleUrl: './about.component.scss',
    imports: [
        DynamicContainerComponent,
        DynamicCardComponent,
        CommonModule
    ]
})
export class AboutComponent implements OnInit{
  @Input() subDescriptor:any;
  test: any =[{}]

  ngOnInit(): void {
    console.log("ABOUT INIT");
    console.log(this.subDescriptor);
  }


}
