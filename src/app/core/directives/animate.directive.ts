/** @format */

import { AfterViewInit, Directive, OnDestroy } from "@angular/core";

@Directive({
  selector: "[appAnimate]",
})
export class AnimateDirective implements AfterViewInit, OnDestroy {
  constructor() {
    console.log("directive");
    // console.log(this.el.nativeElement);
  }

  ngAfterViewInit(): void {
    // console.log(this.el.nativeElement);
    // autoAnimate(this.el.nativeElement);
  }

  ngOnDestroy(): void {}
}
