/** @format */

import { ChangeDetectionStrategy, Component, computed, input, output, signal } from "@angular/core";
import { ProgramImageFrame, ProgramImageKey } from "@domain/program/program-image-framing.model";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 100) / 100;

interface CropBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

@Component({
  selector: "app-program-image-crop",
  templateUrl: "./program-image-crop.component.html",
  styleUrl: "./program-image-crop.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramImageCropComponent {
  readonly source = input.required<string>();
  readonly kind = input.required<ProgramImageKey | null>();
  readonly frame = input.required<ProgramImageFrame>();
  readonly disabled = input(false);
  readonly frameChanged = output<ProgramImageFrame>();
  readonly ready = output<boolean>();
  readonly failedSource = signal<string | null>(null);
  readonly imageRatio = signal(1);
  private readonly cropRatio = computed(() =>
    this.kind() === "cover" ? 5.59 : this.kind() === "mobileCover" ? 2.41 : 1,
  );
  private readonly largest = computed(() => ({
    width: Math.min(1, this.cropRatio() / this.imageRatio()),
    height: Math.min(1, this.imageRatio() / this.cropRatio()),
  }));
  private drag: {
    id: number;
    x: number;
    y: number;
    surface: DOMRect;
    box: CropBox;
    corner: HTMLElement["dataset"] | null;
  } | null = null;

  readonly box = computed(() => {
    const { x, y, zoom } = this.frame();
    const width = this.largest().width / zoom;
    const height = this.largest().height / zoom;
    return { width, height, left: (x / 100) * (1 - width), top: (y / 100) * (1 - height) };
  });

  imageLoaded(image: HTMLImageElement, ready: boolean): void {
    this.failedSource.set(ready ? null : this.source());
    if (ready) this.imageRatio.set(image.naturalWidth / image.naturalHeight);
    this.ready.emit(ready);
  }

  keyFrame(event: KeyboardEvent): void {
    if (this.disabled() || !this.kind()) return;
    const step = event.shiftKey ? 10 : 2;
    const { x, y, zoom } = this.frame();
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const delta = directions[event.key];
    if (delta) {
      event.preventDefault();
      this.frameChanged.emit({
        x: clamp(x + delta[0] * step, 0, 100),
        y: clamp(y + delta[1] * step, 0, 100),
        zoom,
      });
    } else if (["+", "=", "-"].includes(event.key)) {
      event.preventDefault();
      this.frameChanged.emit({
        x,
        y,
        zoom: round(clamp(zoom + (event.key === "-" ? -0.1 : 0.1), 1, 3)),
      });
    }
  }

  startDrag(event: PointerEvent, surface: HTMLElement): void {
    if (this.disabled() || event.button !== 0 || !event.isPrimary) return;
    const element = event.currentTarget as HTMLElement;
    const target = event.target as HTMLElement;
    this.drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      surface: surface.getBoundingClientRect(),
      box: this.box(),
      corner: target.dataset["x"] ? target.dataset : null,
    };
    event.preventDefault();
    element.focus({ preventScroll: true });
    element.setPointerCapture(event.pointerId);
  }

  moveDrag(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId || this.disabled()) return;
    const dx = (event.clientX - drag.x) / drag.surface.width;
    const dy = (event.clientY - drag.y) / drag.surface.height;
    const { left, top, width, height } = drag.box;
    if (!drag.corner) {
      this.setBox({ left: left + dx, top: top + dy, width, height });
      return;
    }
    const sx = Number(drag.corner["x"]);
    const sy = Number(drag.corner["y"]);
    const bx = left + (sx === -1 ? width : 0);
    const by = top + (sy === -1 ? height : 0);
    const ratio = height / width;
    const dw = Math.abs(dx) > Math.abs(dy / ratio) ? sx * dx : (sy * dy) / ratio;
    const edgeWidth = Math.min(sx === -1 ? bx : 1 - bx, (sy === -1 ? by : 1 - by) / ratio);
    const nextWidth = clamp(
      width + dw,
      this.largest().width / 3,
      Math.max(width, Math.min(edgeWidth, this.largest().width)),
    );
    const nextHeight = nextWidth * ratio;
    this.setBox({
      left: sx === -1 ? bx - nextWidth : bx,
      top: sy === -1 ? by - nextHeight : by,
      width: nextWidth,
      height: nextHeight,
    });
  }

  stopDrag(): void {
    this.drag = null;
  }

  private setBox({ left, top, width, height }: CropBox): void {
    const frame = this.frame();
    this.frameChanged.emit({
      x: width >= 0.9999 ? frame.x : round(clamp(left / (1 - width), 0, 1) * 100),
      y: height >= 0.9999 ? frame.y : round(clamp(top / (1 - height), 0, 1) * 100),
      zoom: round(clamp(this.largest().width / width, 1, 3)),
    });
  }
}
