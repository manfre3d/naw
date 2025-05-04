import { Component, Input, OnInit } from '@angular/core';
import { DynamicCardComponent } from '../dynamic-card/dynamic-card.component';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  imports: [DynamicCardComponent, SharedModule],
})
export class AboutComponent implements OnInit {
  @Input() subDescriptor: any;
  test: any = [{}];

  ngOnInit(): void {
    console.log('ABOUT INIT');
    console.log(this.subDescriptor);
  }
}
