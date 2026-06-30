import { Directive, ElementRef, HostListener, inject, PLATFORM_ID, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appTilt3d]',
  standalone: true,
})
export class Tilt3dDirective {
  maxTiltX = input(4);
  maxTiltY = input(6);
  perspectivePx = input(1000);

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isBrowser) return;
    const el = this.el.nativeElement;
    const rect = el.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    el.style.transform = `perspective(${this.perspectivePx()}px) rotateX(${-dy * this.maxTiltX()}deg) rotateY(${dx * this.maxTiltY()}deg)`;
    el.style.transition = 'transform 0.1s ease-out';
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (!this.isBrowser) return;
    const el = this.el.nativeElement;
    el.style.transform = `perspective(${this.perspectivePx()}px) rotateX(0deg) rotateY(0deg)`;
    el.style.transition = 'transform 0.5s ease-out';
  }
}
