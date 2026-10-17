/** @format */

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { AVATAR_PLACEHOLDER_URL, ButtonDirective, ImageFramingDirective } from "@uilib";
import {
  DEFAULT_IMAGE_FRAME,
  PROGRAM_DEFAULT_COVER,
  PROGRAM_LOGO_SIZES,
  programImageFraming,
} from "@utils/program-branding";
import {
  ProgramImageFrame,
  ProgramImageFraming,
  ProgramImageKey,
} from "@domain/program/program-image-framing.model";

@Component({
  selector: "app-program-branding-preview",
  imports: [ButtonDirective, ImageFramingDirective],
  templateUrl: "./branding-preview.component.html",
  styleUrl: "./branding-preview.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramBrandingPreviewComponent {
  readonly cover = input<string | null>(null);
  readonly logo = input<string | null>(null);
  readonly mobileCover = input<string | null>(null);
  readonly framing = input<ProgramImageFraming | null>(null);
  readonly disabled = input(false);
  readonly framingChange = output<ProgramImageFraming>();
  readonly busy = input(false);
  readonly device = signal<"desktop" | "mobile">(window.innerWidth < 1000 ? "mobile" : "desktop");
  readonly target = signal<"cover" | "logo">("cover");
  readonly frames = computed(() => programImageFraming(this.framing()));
  readonly coverKey = computed<ProgramImageKey>(() =>
    this.device() === "mobile" ? "mobileCover" : "cover",
  );
  readonly activeKey = computed<ProgramImageKey>(() =>
    this.target() === "logo" ? "logo" : this.coverKey(),
  );
  readonly activeFrame = computed(() => this.frames()[this.activeKey()]);
  readonly zoomPercent = computed(() => Math.round(this.activeFrame().zoom * 100));
  readonly selectedCover = computed(
    () => (this.device() === "mobile" && this.mobileCover()) || this.cover(),
  );
  readonly coverUrl = computed(() => this.selectedCover() || PROGRAM_DEFAULT_COVER);
  readonly logoUrl = computed(() => this.logo() || AVATAR_PLACEHOLDER_URL);
  readonly coverFailed = signal(false);
  readonly logoFailed = signal(false);
  readonly canvasWidth = computed(() => (this.device() === "desktop" ? (1040 * 10) / 12 : 328));
  readonly logoSize = computed(() => PROGRAM_LOGO_SIZES[this.device()]);
  private readonly availableWidth = signal(0);
  private readonly naturalHeight = signal(0);
  readonly scale = computed(() =>
    this.availableWidth() > 0
      ? Math.min(1, Math.max(0, this.availableWidth() - 2) / this.canvasWidth())
      : 1,
  );
  readonly stageWidth = computed(() => this.canvasWidth() * this.scale() + 2);
  readonly stageHeight = computed(() => this.naturalHeight() * this.scale() + 2);
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>("viewport");
  private readonly canvas = viewChild.required<ElementRef<HTMLElement>>("canvas");
  private readonly destroyRef = inject(DestroyRef);
  private drag: {
    id: number;
    element: HTMLElement;
    key: ProgramImageKey;
    x: number;
    y: number;
    frame: ProgramImageFrame;
    overflowX: number;
    overflowY: number;
  } | null = null;

  available(target: "cover" | "logo"): boolean {
    return (
      !this.disabled() &&
      !this.busy() &&
      !!(target === "logo" ? this.logo() : this.selectedCover()) &&
      !(target === "logo" ? this.logoFailed() : this.coverFailed())
    );
  }
  editable(): boolean {
    return this.available(this.target());
  }
  private updateFrame(key: ProgramImageKey, frame: ProgramImageFrame): void {
    if (!this.editable()) return;
    const next = {
      x: Math.round(Math.min(100, Math.max(0, frame.x)) * 100) / 100,
      y: Math.round(Math.min(100, Math.max(0, frame.y)) * 100) / 100,
      zoom: Math.round(Math.min(3, Math.max(1, frame.zoom)) * 100) / 100,
    };
    const previous = this.frames()[key];
    if (next.x === previous.x && next.y === previous.y && next.zoom === previous.zoom) return;
    this.framingChange.emit({ ...this.frames(), [key]: next });
  }
  setZoom(event: Event): void {
    const zoom = Number((event.target as HTMLInputElement).value);
    if (Number.isFinite(zoom)) this.updateFrame(this.activeKey(), { ...this.activeFrame(), zoom });
  }
  move(x: number, y: number): void {
    const frame = this.activeFrame();
    this.updateFrame(this.activeKey(), { ...frame, x: frame.x + x, y: frame.y + y });
  }
  resetFrame(): void {
    this.updateFrame(this.activeKey(), { ...DEFAULT_IMAGE_FRAME });
  }
  onFrameKey(event: KeyboardEvent, target: "cover" | "logo"): void {
    if (!this.available(target)) return;
    const direction: Record<string, [number, number]> = {
      ArrowLeft: [1, 0],
      ArrowRight: [-1, 0],
      ArrowUp: [0, 1],
      ArrowDown: [0, -1],
    };
    const delta = direction[event.key];
    if (!delta) return;
    event.preventDefault();
    this.target.set(target);
    const step = event.shiftKey ? 10 : 2;
    this.move(delta[0] * step, delta[1] * step);
  }
  startDrag(event: PointerEvent, target: "cover" | "logo"): void {
    if (event.button !== 0 || event.isPrimary === false || !this.available(target)) return;
    this.target.set(target);
    const element = event.currentTarget as HTMLElement;
    const img = element.querySelector("img");
    if (!img?.naturalWidth || !img.naturalHeight) return;
    const frame = this.activeFrame();
    const imageScale =
      Math.max(element.clientWidth / img.naturalWidth, element.clientHeight / img.naturalHeight) *
      frame.zoom;
    this.drag = {
      id: event.pointerId,
      element,
      key: this.activeKey(),
      x: event.clientX,
      y: event.clientY,
      frame,
      overflowX: Math.max(0, img.naturalWidth * imageScale - element.clientWidth) * this.scale(),
      overflowY: Math.max(0, img.naturalHeight * imageScale - element.clientHeight) * this.scale(),
    };
    event.preventDefault();
    element.focus({ preventScroll: true });
    element.setPointerCapture?.(event.pointerId);
  }
  moveDrag(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId || drag.key !== this.activeKey() || !this.editable())
      return;
    event.preventDefault();
    this.updateFrame(drag.key, {
      ...drag.frame,
      x:
        drag.frame.x - (drag.overflowX > 0 ? ((event.clientX - drag.x) / drag.overflowX) * 100 : 0),
      y:
        drag.frame.y - (drag.overflowY > 0 ? ((event.clientY - drag.y) / drag.overflowY) * 100 : 0),
    });
  }
  stopDrag(): void {
    const drag = this.drag;
    this.drag = null;
    if (drag?.element.hasPointerCapture?.(drag.id)) drag.element.releasePointerCapture(drag.id);
  }

  constructor() {
    this.destroyRef.onDestroy(() => this.stopDrag());
    effect(() => {
      this.coverUrl();
      this.coverFailed.set(false);
    });
    effect(() => {
      this.logoUrl();
      this.logoFailed.set(false);
    });
    afterNextRender(() => {
      const viewport = this.viewport().nativeElement;
      const canvas = this.canvas().nativeElement;
      const measure = () => {
        this.availableWidth.set(viewport.clientWidth);
        this.naturalHeight.set(Number.parseFloat(getComputedStyle(canvas).height) || 0);
      };
      measure();
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(measure);
      observer.observe(viewport);
      observer.observe(canvas);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
