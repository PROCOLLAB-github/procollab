/** @format */

import { ElementRef, inject, Injectable, Renderer2, signal } from "@angular/core";

@Injectable()
export class SwipeService {
  private readonly renderer = inject(Renderer2);

  private swipeStartY = signal<number>(0);
  private swipeThreshold = signal<number>(50);
  private isSwiping = signal<boolean>(false);
  isFilterOpen = signal<boolean>(false);

  onSwipeStart(event: TouchEvent): void {
    this.swipeStartY.set(event.touches[0].clientY);
    this.isSwiping.set(true);
  }

  onSwipeMove(event: TouchEvent, filterBody: ElementRef<HTMLElement>): void {
    if (!this.isSwiping) return;

    const currentY = event.touches[0].clientY;
    const deltaY = currentY - this.swipeStartY();

    const progress = Math.min(deltaY / this.swipeThreshold(), 1);
    this.renderer.setStyle(
      filterBody.nativeElement,
      "transform",
      `translateY(${progress * 100}px)`
    );
  }

  onSwipeEnd(event: TouchEvent, filterBody: ElementRef<HTMLElement>): void {
    if (!this.isSwiping) return;

    const endY = event.changedTouches[0].clientY;
    const deltaY = endY - this.swipeStartY();

    if (deltaY > this.swipeThreshold()) {
      this.closeFilter();
    }

    this.isSwiping.set(false);

    this.renderer.setStyle(filterBody.nativeElement, "transform", "translateY(0)");
  }

  closeFilter(): void {
    this.isFilterOpen.set(false);
  }
}
