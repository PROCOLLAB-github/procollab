/** @format */

import { booleanAttribute, Directive, input } from "@angular/core";

/** Native adapter for the same Button foundation; keeps form semantics and HTMLElement refs. */
@Directive({
  selector: "button[appButton]",
  host: {
    "[class]": "'ui-button ui-button--' + appButton()",
    "[disabled]": "disabled() || appButtonLoading()",
    "[attr.aria-busy]": "appButtonLoading() || null",
  },
})
export class ButtonDirective {
  readonly appButton = input<"primary" | "secondary" | "danger" | "icon" | "text">("secondary");
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly appButtonLoading = input(false, { transform: booleanAttribute });
}
