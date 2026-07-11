import { Directive, ElementRef, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Feeds --x/--y to the host so the global `.spotlight-glow` utility can track
// the pointer. Apply both together: class="spotlight-glow" appSpotlight.
@Directive({
  selector: '[appSpotlight]',
  standalone: true,
})
export class SpotlightDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.isBrowser) return;
    const el = this.el.nativeElement;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--x', `${event.clientX - rect.left}px`);
    el.style.setProperty('--y', `${event.clientY - rect.top}px`);
  }
}
