import { Directive, ElementRef, HostListener, inject, PLATFORM_ID, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

@Directive({
  selector: '[appMagneticHover]',
  standalone: true,
})
export class MagneticHoverDirective {
  strength = input(0.28);
  returnDuration = input(0.8);

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly reduceMotion = this.isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private moveX = this.isBrowser && !this.reduceMotion
    ? gsap.quickTo(this.el.nativeElement, 'x', { duration: 0.3, ease: 'power2.out' })
    : null;
  private moveY = this.isBrowser && !this.reduceMotion
    ? gsap.quickTo(this.el.nativeElement, 'y', { duration: 0.3, ease: 'power2.out' })
    : null;

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.moveX || !this.moveY) return;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    this.moveX(dx * this.strength());
    this.moveY(dy * this.strength());
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (!this.moveX || !this.moveY) return;
    gsap.to(this.el.nativeElement, { x: 0, y: 0, duration: this.returnDuration(), ease: 'elastic.out(1, 0.4)' });
  }
}
