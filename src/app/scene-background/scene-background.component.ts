import { Component, ChangeDetectionStrategy, afterNextRender, viewChild, ElementRef, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActiveSectionService } from '../services/active-section.service';
import { DescriptorSection } from '../models/descriptor.model';
import type * as THREE from 'three';

type SectionType = DescriptorSection['type'];

interface SectionParams {
  hueShift: number;
  opacityMul: number;
  camZ: number;
  connDistMul: number;
}

// Tasteful per-section deltas over the base scene — all relative to Hero's
// defaults (hueShift 0, opacityMul 1, camZ 22, connDistMul 1). Keeps every
// section on the same accent palette, just subtly denser/further/tinted.
const SECTION_PARAMS: Record<SectionType, SectionParams> = {
  HEADER:     { hueShift: 0,  opacityMul: 1.0,  camZ: 22, connDistMul: 1.0 },
  HERO:       { hueShift: 0,  opacityMul: 1.0,  camZ: 22, connDistMul: 1.0 },
  SKILLS:     { hueShift: -8, opacityMul: 0.85, camZ: 26, connDistMul: 1.15 },
  EXPERIENCE: { hueShift: 6,  opacityMul: 0.75, camZ: 30, connDistMul: 0.9 },
  EDUCATION:  { hueShift: -4, opacityMul: 0.8,  camZ: 28, connDistMul: 1.05 },
  PROJECTS:   { hueShift: 10, opacityMul: 0.9,  camZ: 24, connDistMul: 1.2 },
  CONTACTS:   { hueShift: 0,  opacityMul: 0.6,  camZ: 32, connDistMul: 0.8 },
  FOOTER:     { hueShift: 0,  opacityMul: 0.5,  camZ: 34, connDistMul: 0.7 },
};

@Component({
  selector: 'app-scene-background',
  standalone: true,
  imports: [],
  templateUrl: './scene-background.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './scene-background.component.scss'
})
export class SceneBackgroundComponent implements OnDestroy {
  bgCanvas = viewChild<ElementRef<HTMLCanvasElement>>('bgCanvas');

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly activeSection = inject(ActiveSectionService);
  private rafId = 0;
  private threeRenderer: { dispose(): void } | null = null;
  private onMouseMove!: (e: MouseEvent) => void;
  private onResize!: () => void;
  private onVisibility!: () => void;
  private nodeTex: { dispose(): void } | null = null;

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.initThreeScene();
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

  private async initThreeScene(): Promise<void> {
    const canvasRef = this.bgCanvas();
    if (!canvasRef) return;
    const canvas = canvasRef.nativeElement;
    let W = window.innerWidth;
    let H = window.innerHeight;

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
    const BASE_CONN_DIST = 5.5;

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

    let mxT = 0, myT = 0, mxC = 0, myC = 0;
    let camZ = 22, connDist = BASE_CONN_DIST, opacityMul = 1;
    const baseNodeOpacity = { light: 0.9,  dark: 1.0 };
    const baseLineOpacity = { light: 0.3,  dark: 0.30 };
    // Neutral, not accent-tinted — keeps the pink accent legible (section
    // labels, badges) against the web instead of both competing on hue.
    const baseLineColor   = { light: 0x9AA0AC, dark: 0x9CA3AF };

    this.onMouseMove = (e: MouseEvent) => {
      mxT = e.clientX / window.innerWidth  - 0.5;
      myT = e.clientY / window.innerHeight - 0.5;
    };
    this.onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);

    const tick = () => {
      this.rafId = requestAnimationFrame(tick);

      // 0. Lerp toward the active section's target visual params
      const target = SECTION_PARAMS[this.activeSection.activeSection()] ?? SECTION_PARAMS['HERO'];
      camZ += (target.camZ - camZ) * 0.03;
      connDist += (target.connDistMul * BASE_CONN_DIST - connDist) * 0.03;
      opacityMul += (target.opacityMul - opacityMul) * 0.03;
      const connDistSq = connDist * connDist;

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
          if (dx * dx + dy * dy + dz * dz < connDistSq) {
            const li = lineCount * 6;
            linePos[li]     = nodePos[a * 3];     linePos[li + 1] = nodePos[a * 3 + 1]; linePos[li + 2] = nodePos[a * 3 + 2];
            linePos[li + 3] = nodePos[b * 3];     linePos[li + 4] = nodePos[b * 3 + 1]; linePos[li + 5] = nodePos[b * 3 + 2];
            lineCount++;
          }
        }
      }
      (lineGeo.attributes['position'] as THREE.BufferAttribute).needsUpdate = true;
      lineGeo.setDrawRange(0, lineCount * 2);

      // 3. Mouse parallax + section-driven camera depth
      mxC += (mxT - mxC) * 0.04;
      myC += (myT - myC) * 0.04;
      camera.position.x = mxC * 2.5;
      camera.position.y = -myC * 1.5;
      camera.position.z = camZ;
      camera.lookAt(scene.position);

      // 4. Theme-aware material colors, tinted + faded per active section
      const dark = document.documentElement.dataset['theme'] === 'dark';
      const themeKey = dark ? 'dark' : 'light';
      const baseColor = dark ? 0xE07899 : 0xD4668A;
      nodeMat.color.setHex(baseColor).offsetHSL(target.hueShift / 360, 0, 0);
      nodeMat.opacity = baseNodeOpacity[themeKey] * opacityMul;
      lineMat.color.setHex(baseLineColor[themeKey]).offsetHSL(target.hueShift / 360, 0, 0);
      lineMat.opacity = baseLineOpacity[themeKey] * opacityMul;

      renderer.render(scene, camera);
    };

    tick();

    this.onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(this.rafId);
      } else {
        tick();
      }
    };
    document.addEventListener('visibilitychange', this.onVisibility);
  }
}
