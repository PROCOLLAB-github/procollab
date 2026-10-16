/** @format */

import { Directive, input } from "@angular/core";

/** Surface adapter: entity cards keep their content and share the same presentation. */
@Directive({
  selector: "[appCard]",
  host: { class: "ui-card", "[class.ui-card--interactive]": "interactive()" },
})
export class CardDirective {
  readonly interactive = input(false);
}

@Directive({ selector: "input[appField],textarea[appField]", host: { class: "ui-field" } })
export class FieldDirective {}

@Directive({ selector: "input[appChoice]", host: { class: "ui-choice" } })
export class ChoiceDirective {}

@Directive({ selector: "table[appTable]", host: { class: "ui-table" } })
export class TableDirective {}

@Directive({ selector: "[appFormLayout]", host: { class: "ui-form" } })
export class FormLayoutDirective {}

@Directive({ selector: "[appFilters]", host: { class: "ui-filters" } })
export class FiltersDirective {}

@Directive({ selector: "[appDialogBody]", host: { class: "ui-dialog-body" } })
export class DialogBodyDirective {}

@Directive({ selector: "[appDialogFooter]", host: { class: "ui-dialog-footer" } })
export class DialogFooterDirective {}

@Directive({ selector: "[appDrawer]", host: { class: "ui-drawer" } })
export class DrawerDirective {}

@Directive({
  selector: "[appAlert]",
  host: {
    class: "ui-alert",
    "[attr.role]": 'appAlert() === "error" ? "alert" : "status"',
    "[class.ui-alert--error]": 'appAlert() === "error"',
    "[class.ui-alert--success]": 'appAlert() === "success"',
    "[class.ui-alert--warning]": 'appAlert() === "warning"',
  },
})
export class AlertDirective {
  readonly appAlert = input<"info" | "success" | "warning" | "error">("info");
}
