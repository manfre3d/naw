import { AfterViewInit, Component, Input, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeroComponent } from '../hero/hero.component';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { AboutComponent } from '../about/about.component';
import { DynamicCardComponent } from '../dynamic-card/dynamic-card.component';
import { ContactsComponent } from '../contacts/contacts.component';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-dynamic-single-container',
  standalone: true,
  imports: [
    SharedModule,
    HeroComponent,
    FooterComponent,
    HeaderComponent,
    DynamicCardComponent,
    AboutComponent,
    ContactsComponent,
  ],
  templateUrl: './dynamic-single-container.component.html',
  styleUrls: [
    './dynamic-single-container.component.scss', // Corrected from 'styleUrl' to 'styleUrls'
  ],
})
export class DynamicSingleContainerComponent implements AfterViewInit {
  @Input() section: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.onScrollAnimationInit();
    }
  }

  onScrollAnimationInit(): void {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
          } else {
            entry.target.classList.remove('show');
          }
        });
      });

      const hiddenElements = document.querySelectorAll('.hidden');
      hiddenElements.forEach((element) => observer.observe(element));
    } else {
      console.warn('IntersectionObserver is not supported in this browser.');
    }
  }
}