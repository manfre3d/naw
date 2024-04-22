import { Component, Input, OnInit } from '@angular/core';
import { DynamicSingleContainerComponent } from '../dynamic-single-container/dynamic-single-container.component';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-dynamic-container',
  standalone: true,
  imports: [
    DynamicSingleContainerComponent,
    SharedModule
  ],
  templateUrl: './dynamic-container.component.html',
  styleUrl: './dynamic-container.component.scss'
})
export class DynamicContainerComponent implements OnInit{

  @Input() descriptor :any;
  ngOnInit(): void{
    console.log("DYNAMICA CONTAINER INIT");

    console.log(this.descriptor);
  }


}
