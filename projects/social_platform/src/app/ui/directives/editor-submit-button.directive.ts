/** @format */

import { AfterViewInit, Directive, Input, OnDestroy, ViewContainerRef } from "@angular/core";
import { fromEvent, Subscription } from "rxjs";
import { containerSm } from "@utils/responsive";

@Directive({
    selector: "[appEditorSubmitButton]",
    standalone: true,
})
export class EditorSubmitButtonDirective implements AfterViewInit, OnDestroy {
  constructor(private readonly viewRef: ViewContainerRef) {}

  @Input() containerSelector = "profile";

  ngAfterViewInit(): void {
    if (window.innerWidth > containerSm)
      setTimeout(() => {
        this.initSaveButtonScroller();
      }, 0);
  }

  ngOnDestroy(): void {
    this.scrollSubscription$?.unsubscribe();
  }

  scrollSubscription$?: Subscription;

  initSaveButtonScroller(): void {
    const scroller = document.querySelector(".office__body");
    const container = document.querySelector(this.containerSelector);
    const topBar = document.querySelector(".office__top");
    if (!scroller || !container || !topBar) return;

    this.scrollSubscription$ = fromEvent(scroller, "scroll").subscribe(() => {
      const { top: containerTop } = container.getBoundingClientRect();
      const actualScroll = containerTop - topBar.clientHeight;

      if (actualScroll < 0) {
        this.viewRef.element.nativeElement.style.top = `${Math.abs(actualScroll) + 24}px`;
      }
    });
  }
}
