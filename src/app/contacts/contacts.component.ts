import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ContactsSection } from '../models/descriptor.model';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [],
  templateUrl: './contacts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {
  subDescriptor = input.required<ContactsSection>();
}
