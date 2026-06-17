import { Component, ChangeDetectionStrategy, input, signal, afterNextRender } from '@angular/core';
import { HeroSection } from '../models/descriptor.model';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  subDescriptor = input.required<HeroSection>();

  displayedText = signal('');
  showCursor = signal(true);

  constructor() {
    afterNextRender(() => this.startTyping());
  }

  private startTyping(): void {
    const phrases = this.subDescriptor().typingPhrases;
    if (!phrases?.length) return;

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;

    const tick = () => {
      const current = phrases[phraseIdx];
      if (!deleting) {
        charIdx++;
        this.displayedText.set(current.slice(0, charIdx));
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(tick, 2200);
          return;
        }
      } else {
        charIdx--;
        this.displayedText.set(current.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? 45 : 80);
    };

    setTimeout(tick, 600);
  }
}
