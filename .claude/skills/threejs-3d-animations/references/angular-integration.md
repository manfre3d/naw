# Angular Integration Reference

## The Canonical Pattern

Three.js must run in the browser after the canvas is mounted. The correct hook is `afterNextRender()`:

```ts
import { Component, afterNextRender, viewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-scene',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #sceneCanvas></canvas>`,
})
export class SceneComponent {
  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('sceneCanvas');
  private animId = 0;
  private renderer?: THREE.WebGLRenderer;

  constructor() {
    afterNextRender(() => this.init());
  }

  private async init(): Promise<void> {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const THREE = await import('three');
    const el = this.canvas().nativeElement;
    // ... build scene, start loop, attach event listeners ...
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
    this.renderer?.dispose();
    // ... remove event listeners ...
  }
}
```

**Key rules:**
- `afterNextRender` — runs once after the first render, browser-only, canvas is in DOM
- **NEVER** `ngOnInit` or `ngAfterViewInit` for Three.js — both can run server-side
- **ALWAYS** `async init()` so you can `await import('three')` cleanly

## SSR Safety

Three.js requires a WebGL context, which only exists in a browser. The `afterNextRender` hook already guards this, but if you need Three.js elsewhere (a service, a pipe), use `isPlatformBrowser`:

```ts
import { isPlatformBrowser, PLATFORM_ID } from '@angular/common';

private platformId = inject(PLATFORM_ID);

someMethod() {
  if (!isPlatformBrowser(this.platformId)) return;
  // safe to use window, document, WebGL
}
```

**AVOID** `typeof window !== 'undefined'` — it's fragile in zone-less Angular. Use `isPlatformBrowser`.

## Lazy Import Pattern

```ts
// PREFER — Three.js lands in a separate chunk, excluded from SSR bundle
const THREE = await import('three');

// For addons (OrbitControls, etc.)
const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
```

**AVOID** top-level `import * as THREE from 'three'` — it pulls Three.js into the main bundle and crashes SSR prerendering.

## Canvas Access via viewChild

```ts
// Signal-based (preferred in Angular 17+)
heroCanvas = viewChild<ElementRef<HTMLCanvasElement>>('heroCanvas');

private init(): void {
  const canvasRef = this.heroCanvas();
  if (!canvasRef) return;
  const canvas = canvasRef.nativeElement;
  const parent = canvas.parentElement!;
  const W = parent.offsetWidth;
  const H = parent.offsetHeight;
  // ...
}
```

**PREFER** sizing the renderer from `parentElement.offsetWidth/Height` rather than `window.innerWidth/Height` — the canvas may live inside a constrained container.

## Event Listener Cleanup

Store all listeners in component fields and remove them in `ngOnDestroy`:

```ts
private onMouse = (e: MouseEvent) => { /* ... */ };
private onResize = () => { /* ... */ };

private init(): void {
  window.addEventListener('mousemove', this.onMouse);
  window.addEventListener('resize', this.onResize);
}

ngOnDestroy(): void {
  window.removeEventListener('mousemove', this.onMouse);
  window.removeEventListener('resize', this.onResize);
  cancelAnimationFrame(this.animId);
  this.renderer?.dispose();
}
```

**AVOID** anonymous lambdas as event listeners — they can't be removed.

## Resize Handling

```ts
private onResize = (): void => {
  const parent = this.canvas().nativeElement.parentElement!;
  const w = parent.offsetWidth;
  const h = parent.offsetHeight;
  this.renderer!.setSize(w, h, false);
  this.camera!.aspect = w / h;
  this.camera!.updateProjectionMatrix();
};
```

## prefers-reduced-motion Gate

Check this **before** starting any animation. If the user prefers reduced motion, skip the Three.js scene entirely (not just slow it down):

```ts
afterNextRender(() => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    this.init();
  }
});
```

## Change Detection

Three.js renders to a `<canvas>` directly — it bypasses Angular's change detection entirely. You do **not** need to call `markForCheck()` or `detectChanges()` for anything Three.js does. Only call them when Three.js state needs to surface in the Angular template.

## Theme Awareness

Read the current theme inside the render loop using a cached value — avoid querying the DOM every frame:

```ts
let lastTheme = '';
const tick = () => {
  requestAnimationFrame(tick);
  const theme = document.documentElement.dataset['theme'] ?? '';
  if (theme !== lastTheme) {
    lastTheme = theme;
    pMat.opacity = theme === 'dark' ? 0.9 : 0.65;
    lMat.opacity = theme === 'dark' ? 0.22 : 0.13;
  }
  this.renderer!.render(scene, camera);
};
```
