/** @format */

import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

@Component({
  selector: "app-badge",
  template: `<span [class]="'badge badge--' + effectiveTone()" role="status"
    >{{ label() }}<ng-content
  /></span>`,
  styleUrl: "./badge.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  readonly color = input<"green" | "red" | "gold">();
  readonly type = input<"deadline" | "start">();
  readonly label = input<string>();
  readonly tone = input<"neutral" | "pending" | "success" | "declined" | "warning">("neutral");
  protected readonly effectiveTone = computed(() =>
    this.color() === "green"
      ? "success"
      : this.color() === "red"
        ? "declined"
        : this.color() === "gold"
          ? "warning"
          : this.tone(),
  );
}
