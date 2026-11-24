/** @format */

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { ButtonDirective, IconComponent } from "@uilib";
import { ProgramGuideStep } from "./program-guide-content";

interface GuidePosition {
  left: number;
  top: number;
  width: number;
  height: number;
  cardLeft: number;
  cardTop: number | null;
}

@Component({
  selector: "app-program-guide-overlay",
  imports: [ButtonDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./program-guide-overlay.component.html",
  styleUrl: "./program-guide-overlay.component.scss",
})
export class ProgramGuideOverlayComponent {
  readonly step = input.required<ProgramGuideStep>();
  readonly target = input<HTMLElement | null>(null);
  readonly index = input.required<number>();
  readonly total = input.required<number>();
  readonly busy = input(false);
  readonly automatic = input(false);
  readonly previous = output<void>();
  readonly next = output<void>();
  readonly closed = output<void>();
  protected readonly position = signal<GuidePosition | null>(null);
  protected readonly inDialog = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly destroy = inject(DestroyRef);
  private readonly mounted = signal(false);

  constructor() {
    afterNextRender(() => {
      const home = this.document.createComment("program-guide");
      this.host.before(home);
      this.mounted.set(true);
      this.destroy.onDestroy(() => {
        this.host.remove();
        home.remove();
      });
      this.home = home;
    });

    effect(onCleanup => {
      const target = this.target();
      const step = this.step();
      const view = this.document.defaultView;
      if (!this.mounted() || !view) return;
      const dialog = target?.closest<HTMLElement>('[role="dialog"][aria-modal="true"]');
      const owner = dialog
        ? Array.from(dialog.children).find(child => child.contains(target ?? null))
        : null;

      if (owner && target) {
        const insertionPoint = Array.from(owner.children).find(child => child.contains(target));
        owner.insertBefore(this.host, insertionPoint?.nextSibling ?? null);
      } else if (this.home?.parentNode) {
        this.home.parentNode.insertBefore(this.host, this.home);
      }
      this.inDialog.set(!!owner);
      const outline = owner && target ? target.style.outline : undefined;
      const outlineOffset = owner && target ? target.style.outlineOffset : undefined;
      if (target && owner) {
        target.style.outline = "2px solid var(--accent)";
        target.style.outlineOffset = "4px";
      }
      const update = () => this.measure(target, view, !!owner);
      if (target && !owner && !this.automatic()) {
        const r = target.getBoundingClientRect();
        if (r.top < 0 || r.bottom > view.innerHeight * 0.68) {
          target.scrollIntoView?.({ block: "center", behavior: "auto" });
        }
      }
      update();

      let nextTimer: ReturnType<typeof setTimeout> | undefined;
      const clicked = () => {
        if (!this.busy()) nextTimer = setTimeout(() => this.next.emit());
      };
      if (step.advance === "click") target?.addEventListener("click", clicked, true);

      const escape = (event: KeyboardEvent) => {
        if (event.key !== "Escape" || event.defaultPrevented) return;
        event.preventDefault();
        event.stopPropagation();
        this.closed.emit();
      };
      this.document.addEventListener("keydown", escape, true);
      view.addEventListener("scroll", update, true);
      view.addEventListener("resize", update);
      const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
      if (target) observer?.observe(target);
      observer?.observe(this.host);

      const raf = view.requestAnimationFrame(() => {
        update();
        if (!this.automatic() && !target?.closest('[role="menu"]')) {
          this.host.querySelector<HTMLElement>(".guide__title")?.focus();
        }
      });
      onCleanup(() => {
        clearTimeout(nextTimer);
        if (target && owner) {
          target.style.outline = outline ?? "";
          target.style.outlineOffset = outlineOffset ?? "";
        }
        target?.removeEventListener("click", clicked, true);
        this.document.removeEventListener("keydown", escape, true);
        view.removeEventListener("scroll", update, true);
        view.removeEventListener("resize", update);
        view.cancelAnimationFrame(raf);
        observer?.disconnect();
      });
    });
  }

  private home?: Comment;

  private measure(target: HTMLElement | null, view: Window, inDialog: boolean): void {
    if (!target?.isConnected || inDialog) {
      this.position.set(null);
      return;
    }
    const rect = target.getBoundingClientRect();
    const margin = 12;
    const left = Math.max(0, rect.left - 5);
    const top = Math.max(0, rect.top - 5);
    const right = Math.min(view.innerWidth, rect.right + 5);
    const bottom = Math.min(view.innerHeight, rect.bottom + 5);
    if (right <= left || bottom <= top) {
      this.position.set(null);
      return;
    }
    const cardWidth = Math.min(348, view.innerWidth - 2 * margin);
    const cardHeight = this.host.querySelector<HTMLElement>(".guide")?.offsetHeight || 200;
    const cardLeft = Math.max(margin, Math.min(rect.left, view.innerWidth - cardWidth - margin));
    const cardTop =
      view.innerWidth < 680
        ? null
        : Math.max(
            margin,
            bottom + cardHeight + 14 <= view.innerHeight - margin
              ? bottom + 14
              : Math.min(top - cardHeight - 14, view.innerHeight - cardHeight - margin),
          );
    this.position.set({ left, top, width: right - left, height: bottom - top, cardLeft, cardTop });
  }
}
