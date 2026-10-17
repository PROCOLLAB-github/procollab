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
  signal,
  viewChild,
} from "@angular/core";
import { AVATAR_PLACEHOLDER_URL, ButtonDirective } from "@uilib";
import { PROGRAM_DEFAULT_COVER, PROGRAM_LOGO_SIZES } from "@utils/program-branding";

@Component({
  selector: "app-program-branding-preview",
  imports: [ButtonDirective],
  templateUrl: "./branding-preview.component.html",
  styleUrl: "./branding-preview.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramBrandingPreviewComponent {
  readonly cover = input<string | null>(null);
  readonly logo = input<string | null>(null);
  readonly busy = input(false);
  readonly device = signal<"desktop" | "mobile">(window.innerWidth < 1000 ? "mobile" : "desktop");
  readonly coverUrl = computed(() => this.cover() || PROGRAM_DEFAULT_COVER);
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

  constructor() {
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
