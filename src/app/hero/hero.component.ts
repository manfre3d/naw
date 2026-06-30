import { Component, ChangeDetectionStrategy, input, signal, computed, afterNextRender, viewChild, ElementRef } from '@angular/core';
import { HeroSection } from '../models/descriptor.model';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
  heroCanvas = viewChild<ElementRef<HTMLCanvasElement>>('heroCanvas');

  // Each inner array is one word; the template renders words in inline-block
  // wrappers with white-space:nowrap so line-breaks only happen between words,
  // never mid-word across individual character spans.
  nameWords = computed(() =>
    this.subDescriptor().primaryHeaderText.split(' ').map(word => word.split(''))
  );

  constructor() {
    afterNextRender(() => {
      this.startTyping();
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.animateName();
        this.initThreeScene();
        this.initMagneticButtons();
        this.initParallax();
      }
    });
  }

  private animateName(): void {
    const chars = document.querySelectorAll<HTMLElement>('.hero-name-char');
    if (!chars.length) return;
    gsap.fromTo(
      chars,
      { rotateX: 90, opacity: 0, y: 20, transformOrigin: '50% 0%' },
      { rotateX: 0, opacity: 1, y: 0, duration: 0.6, stagger: 0.045, ease: 'back.out(1.5)', delay: 0.2 }
    );
  }

  private async initThreeScene(): Promise<void> {
    const canvasRef = this.heroCanvas();
    if (!canvasRef) return;
    const canvas = canvasRef.nativeElement;
    const parent = canvas.parentElement!;
    const W = parent.offsetWidth;
    const H = parent.offsetHeight;

    // Lazy-load Three.js so it lands in a separate chunk and stays out of the
    // initial bundle, keeping it under the 1 MB budget.
    const THREE = await import('three');

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.z = 22;

    const N = 300;
    const pos = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0xD4668A,
      size: 0.13,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
    });

    const points = new THREE.Points(pGeo, pMat);

    const lineVerts: number[] = [];
    const thresh = 5.5;
    const maxSeg = 520;

    outer: for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pos[i*3]   - pos[j*3];
        const dy = pos[i*3+1] - pos[j*3+1];
        const dz = pos[i*3+2] - pos[j*3+2];
        if (dx*dx + dy*dy + dz*dz < thresh * thresh) {
          lineVerts.push(
            pos[i*3], pos[i*3+1], pos[i*3+2],
            pos[j*3], pos[j*3+1], pos[j*3+2],
          );
          if (lineVerts.length / 6 >= maxSeg) break outer;
        }
      }
    }

    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3));

    const lMat = new THREE.LineBasicMaterial({ color: 0xD4668A, transparent: true, opacity: 0.18 });
    const lines = new THREE.LineSegments(lGeo, lMat);

    const group = new THREE.Group();
    group.add(points);
    group.add(lines);
    scene.add(group);

    let mxT = 0, myT = 0, mxC = 0, myC = 0;
    const onMouse = (e: MouseEvent) => {
      mxT = e.clientX / window.innerWidth  - 0.5;
      myT = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('mousemove', onMouse);

    const onResize = () => {
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    let lastTheme = '';
    const tick = () => {
      requestAnimationFrame(tick);
      const t = performance.now() * 0.001;

      group.rotation.y = t * 0.07;
      group.rotation.x = Math.sin(t * 0.035) * 0.1;

      mxC += (mxT - mxC) * 0.04;
      myC += (myT - myC) * 0.04;
      camera.position.x = mxC * 4;
      camera.position.y = -myC * 3;
      camera.lookAt(scene.position);

      const theme = (document.documentElement.dataset['theme'] as string) ?? '';
      if (theme !== lastTheme) {
        lastTheme = theme;
        pMat.opacity = theme === 'dark' ? 0.9  : 0.65;
        lMat.opacity = theme === 'dark' ? 0.22 : 0.13;
      }

      renderer.render(scene, camera);
    };

    tick();
  }

  private initMagneticButtons(): void {
    const buttons = document.querySelectorAll<HTMLElement>('.hero-actions .btn-primary, .hero-actions .btn-outline');
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        gsap.to(btn, { x: dx * 0.28, y: dy * 0.28, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  private initParallax(): void {
    gsap.registerPlugin(ScrollTrigger);
    const frame = document.querySelector('.hero-photo-frame');
    if (!frame) return;
    gsap.to(frame, {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: { trigger: '.hero-wrapper', start: 'top top', end: 'bottom top', scrub: true }
    });
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
