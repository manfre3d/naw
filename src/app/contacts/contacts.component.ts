import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {
  @Input() subDescriptor:any;

  ngOnInit(): void {
    console.log("contacts INIT");
    console.log(this.subDescriptor);
  }
}
