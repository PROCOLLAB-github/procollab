/** @format */

import { computed, Directive, input } from "@angular/core";

export interface ImageFraming {
  x: number;
  y: number;
  zoom: number;
}

/** The parent clips the frame; the original image remains untouched. */
@Directive({
  selector: "img[appImageFraming]",
  host: {
    "[style.object-fit]": "'cover'",
    "[style.object-position]": "position()",
    "[style.transform-origin]": "position()",
    "[style.transform]": "'scale(' + zoom() + ')'",
  },
})
export class ImageFramingDirective {
  readonly appImageFraming = input<Partial<ImageFraming> | null>();
  private number(value: unknown, fallback: number, min: number, max: number): number {
    return typeof value === "number" && Number.isFinite(value)
      ? Math.min(max, Math.max(min, value))
      : fallback;
  }
  readonly position = computed(() => {
    const frame = this.appImageFraming();
    return `${this.number(frame?.x, 50, 0, 100)}% ${this.number(frame?.y, 50, 0, 100)}%`;
  });
  readonly zoom = computed(() => this.number(this.appImageFraming()?.zoom, 1, 1, 3));
}
