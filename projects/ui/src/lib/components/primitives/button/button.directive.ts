/** @format */

import {
  booleanAttribute,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
} from "@angular/core";

/** Native adapter for the same Button foundation; keeps form semantics and HTMLElement refs. */
@Directive({
  selector: "button[appButton], a[appButton]",
  host: {
    "[class]": "'ui-button ui-button--' + appButton()",
    "[attr.disabled]": "nativeButton && (disabled() || appButtonLoading()) ? '' : null",
    "[attr.aria-busy]": "appButtonLoading() || null",
    "[attr.aria-disabled]": "disabled() || appButtonLoading() || null",
  },
})
export class ButtonDirective {
  readonly nativeButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === "BUTTON";
  @HostListener("click", ["$event"]) onClick(event: MouseEvent): void {
    if (this.disabled() || this.appButtonLoading()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
  readonly appButton = input<"primary" | "secondary" | "danger" | "icon" | "text">("secondary");
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly appButtonLoading = input(false, { transform: booleanAttribute });
}
