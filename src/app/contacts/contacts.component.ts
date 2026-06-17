import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ContactsSection } from '../models/descriptor.model';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [],
  templateUrl: './contacts.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {
  @Input() subDescriptor!: ContactsSection;
}
