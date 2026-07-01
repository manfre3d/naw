import { Component, ChangeDetectionStrategy, input, signal, computed, afterNextRender, viewChild, ElementRef, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeroSection } from '../models/descriptor.model';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type * as THREE from 'three';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnDestroy {
  subDescriptor = input.required<HeroSection>();
  displayedText = signal('');
  heroCanvas = viewChild<ElementRef<HTMLCanvasElement>>('heroCanvas');

  nameWords = computed(() =>
    this.subDescriptor().primaryHeaderText.split(' ').map(word => word.split(''))
  );

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private rafId = 0;
  private threeRenderer: { dispose(): void } | null = null;
  private onMouseMove!: (e: MouseEvent) => void;
  private onResize!: () => void;
  private onVisibility!: () => void;
  private nodeTex: { dispose(): void } | null = null;

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

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.threeRenderer?.dispose();
    this.nodeTex?.dispose();
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

    const THREE = await import('three');

    const makeSpriteTexture = (size: number, r: number, g: number, b: number) => {
      const offscreen = document.createElement('canvas');
      offscreen.width = offscreen.height = size;
      const ctx = offscreen.getContext('2d')!;
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0,   `rgba(${r},${g},${b},1)`);
      grad.addColorStop(0.4, `rgba(${r},${g},${b},0.6)`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(offscreen);
    };

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    this.threeRenderer = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.z = 22;

    // Constellation scene — nodes + dynamic connections
    const NODE_COUNT = 350;
    const MAX_LINES  = 1500;
    const CONN_DIST  = 5.5;
    const CONN_DIST_SQ = CONN_DIST * CONN_DIST;

    const nodePos = new Float32Array(NODE_COUNT * 3);
    const nodeVel = new Float32Array(NODE_COUNT * 3);
    for (let i = 0; i < NODE_COUNT; i++) {
      nodePos[i * 3]     = (Math.random() - 0.5) * 36;
      nodePos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      nodePos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      nodeVel[i * 3]     = (Math.random() - 0.5) * 0.008;
      nodeVel[i * 3 + 1] = (Math.random() - 0.5) * 0.008;
      nodeVel[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
    }
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));

    this.nodeTex = makeSpriteTexture(32, 212, 102, 138);
    const nodeMat = new THREE.PointsMaterial({
      color: 0xD4668A, size: 0.18, sizeAttenuation: true,
      transparent: true, opacity: 0.85, depthWrite: false,
      blending: THREE.AdditiveBlending,
      map: this.nodeTex as unknown as THREE.Texture,
      alphaTest: 0.05,
    });
    scene.add(new THREE.Points(nodeGeo, nodeMat));

    const linePos = new Float32Array(MAX_LINES * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    lineGeo.setDrawRange(0, 0);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x9CA3AF, transparent: true, opacity: 0.2 });
    scene.add(new THREE.LineSegments(lineGeo, lineMat));

    let mxT = 0, myT = 0, mxC = 0, myC = 0, prev = performance.now(), lastTheme = '';

    this.onMouseMove = (e: MouseEvent) => {
      mxT = e.clientX / window.innerWidth  - 0.5;
      myT = e.clientY / window.innerHeight - 0.5;
    };
    this.onResize = () => {
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);

    const tick = () => {
      this.rafId = requestAnimationFrame(tick);
      const now = performance.now();
      prev = now;

      // 1. Drift nodes + toroidal wrap
      for (let i = 0; i < NODE_COUNT; i++) {
        nodePos[i * 3]     += nodeVel[i * 3];
        nodePos[i * 3 + 1] += nodeVel[i * 3 + 1];
        nodePos[i * 3 + 2] += nodeVel[i * 3 + 2];
        if (nodePos[i * 3]     >  18) nodePos[i * 3]     = -18;
        if (nodePos[i * 3]     < -18) nodePos[i * 3]     =  18;
        if (nodePos[i * 3 + 1] >  11) nodePos[i * 3 + 1] = -11;
        if (nodePos[i * 3 + 1] < -11) nodePos[i * 3 + 1] =  11;
        if (nodePos[i * 3 + 2] >   6) nodePos[i * 3 + 2] =  -6;
        if (nodePos[i * 3 + 2] <  -6) nodePos[i * 3 + 2] =   6;
      }
      (nodeGeo.attributes['position'] as THREE.BufferAttribute).needsUpdate = true;

      // 2. Build connections — O(n²/2) distance checks, capped at MAX_LINES
      let lineCount = 0;
      outer: for (let a = 0; a < NODE_COUNT - 1; a++) {
        for (let b = a + 1; b < NODE_COUNT; b++) {
          if (lineCount >= MAX_LINES) break outer;
          const dx = nodePos[a * 3]     - nodePos[b * 3];
          const dy = nodePos[a * 3 + 1] - nodePos[b * 3 + 1];
          const dz = nodePos[a * 3 + 2] - nodePos[b * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < CONN_DIST_SQ) {
            const li = lineCount * 6;
            linePos[li]     = nodePos[a * 3];     linePos[li + 1] = nodePos[a * 3 + 1]; linePos[li + 2] = nodePos[a * 3 + 2];
            linePos[li + 3] = nodePos[b * 3];     linePos[li + 4] = nodePos[b * 3 + 1]; linePos[li + 5] = nodePos[b * 3 + 2];
            lineCount++;
          }
        }
      }
      (lineGeo.attributes['position'] as THREE.BufferAttribute).needsUpdate = true;
      lineGeo.setDrawRange(0, lineCount * 2);

      // 3. Mouse parallax
      mxC += (mxT - mxC) * 0.04;
      myC += (myT - myC) * 0.04;
      camera.position.x = mxC * 2.5;
      camera.position.y = -myC * 1.5;
      camera.lookAt(scene.position);

      // 4. Theme-aware material colors
      const theme = (document.documentElement.dataset['theme'] as string) ?? '';
      if (theme !== lastTheme) {
        lastTheme = theme;
        const dark = theme === 'dark';
        nodeMat.color.set(dark ? 0xE07899 : 0xD4668A);
        nodeMat.opacity = dark ? 1.0 : 0.85;
        lineMat.opacity = dark ? 0.30 : 0.18;
      }

      renderer.render(scene, camera);
    };

    tick();

    this.onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(this.rafId);
      } else {
        prev = performance.now();
        tick();
      }
    };
    document.addEventListener('visibilitychange', this.onVisibility);
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
