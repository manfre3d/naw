import { Component, Input } from '@angular/core';
import { ContactsSection } from '../models/descriptor.model';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {
  @Input() subDescriptor!: ContactsSection;
}
