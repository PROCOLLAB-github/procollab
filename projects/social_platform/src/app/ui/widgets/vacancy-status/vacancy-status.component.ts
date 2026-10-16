/** @format */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { BadgeComponent } from "@uilib";

@Component({
  selector: "app-vacancy-status",
  imports: [BadgeComponent],
  template: `<app-badge [class]="'status status--' + tone()" [label]="label()" [tone]="tone()" />`,
  styleUrl: "./vacancy-status.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacancyStatusComponent {
  readonly label = input.required<string>();
  readonly tone = input<"neutral" | "pending" | "success" | "declined">("neutral");
}
