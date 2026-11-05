/** @format */

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from "@angular/core";
import {
  ConnectedOverlayPositionChange,
  ConnectedPosition,
  OverlayModule,
} from "@angular/cdk/overlay";
import { IconComponent } from "../icon/icon.component";

let nextPanelId = 0;

/** The UI Kit tooltip with selectable, interactive content and an explicit open state. */
@Component({
  selector: "app-interactive-tooltip",
  imports: [OverlayModule, IconComponent],
  templateUrl: "./interactive-tooltip.component.html",
  styleUrls: ["./tooltip.component.scss", "./interactive-tooltip.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InteractiveTooltipComponent {
  readonly label = input.required<string>();
  protected readonly opened = signal(false);
  protected readonly placement = signal<"left" | "right" | "below">("left");
  protected readonly panelId = `interactive-tooltip-${nextPanelId++}`;
  protected readonly positions: ConnectedPosition[] = [
    { originX: "start", originY: "center", overlayX: "end", overlayY: "center", offsetX: -8 },
    { originX: "end", originY: "center", overlayX: "start", overlayY: "center", offsetX: 8 },
    { originX: "end", originY: "bottom", overlayX: "end", overlayY: "top", offsetY: 4 },
  ];

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>("trigger");
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>("panel");
  private readonly injector = inject(Injector);
  private hideTimer: ReturnType<typeof setTimeout> | undefined;
  private pinned = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancelHide());
  }

  protected enterTrigger(event: PointerEvent): void {
    if (event.pointerType === "touch") return;
    this.cancelHide();
    this.opened.set(true);
  }

  protected cancelHide(): void {
    clearTimeout(this.hideTimer);
  }

  protected leave(): void {
    if (this.pinned) return;
    this.cancelHide();
    // Allow the pointer to cross the gap between the icon and the floating panel.
    this.hideTimer = setTimeout(() => this.close(), 220);
  }

  protected pin(): void {
    this.cancelHide();
    this.pinned = true;
    this.opened.set(true);
  }

  protected toggle(event: MouseEvent): void {
    if (this.pinned) {
      this.close();
      return;
    }
    this.pin();
    if (event.detail === 0) {
      afterNextRender(() => this.panel()?.nativeElement.focus(), { injector: this.injector });
    }
  }

  protected closeOutside(event: MouseEvent): void {
    if (!event.composedPath().includes(this.trigger().nativeElement)) this.close();
  }

  protected escape(event: KeyboardEvent): void {
    if (event.key !== "Escape" || !this.opened()) return;
    event.preventDefault();
    event.stopPropagation();
    this.close();
    this.trigger().nativeElement.focus();
  }

  protected reposition(event: ConnectedOverlayPositionChange): void {
    const { originX, originY } = event.connectionPair;
    this.placement.set(originY === "bottom" ? "below" : originX === "start" ? "left" : "right");
  }

  private close(): void {
    this.cancelHide();
    this.pinned = false;
    this.opened.set(false);
  }
}
