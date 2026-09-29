/** @format */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-vacancy-status",
  template: `<span [class]="'status status--' + tone()" role="status">{{ label() }}</span>`,
  styleUrl: "./vacancy-status.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacancyStatusComponent {
  readonly label = input.required<string>();
  readonly tone = input<"neutral" | "pending" | "success" | "declined">("neutral");
}
