/** @format */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { LoaderComponent } from "../../primitives/loader/loader.component";
import { IconComponent } from "../../primitives/icon/icon.component";

/** Text and retry actions belong to the caller; presentation is shared across lists. */
@Component({
  selector: "app-state",
  imports: [LoaderComponent, IconComponent],
  template: `
    <div
      class="state"
      [class.state--compact]="compact()"
      [class.state--error]="kind() === 'error'"
      [attr.role]="kind() === 'error' ? 'alert' : 'status'"
      [attr.aria-busy]="kind() === 'loading' || null"
    >
      @if (kind() === "loading") {
        <app-loader color="accent" size="24px" />
      } @else if (!compact()) {
        <i appIcon [icon]="icon()" appSquare="38" aria-hidden="true"></i>
      }
      @if (title()) {
        <p class="state__title">{{ title() }}</p>
      }
      @if (description()) {
        <p class="state__description">{{ description() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .state {
      display: flex;
      flex-direction: column;
      gap: var(--ui-space-md);
      align-items: center;
      padding: var(--ui-space-lg);
      text-align: center;
      color: var(--ui-text-muted);
      overflow-wrap: anywhere;
    }
    .state--error {
      color: var(--ui-danger);
    }
    .state__title {
      font-size: var(--ui-font-body);
      line-height: 1.5;
    }
    .state__description {
      font-size: var(--ui-font-small);
      line-height: 1.5;
    }
    .state--compact {
      padding: var(--ui-space-sm);
      gap: var(--ui-space-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateComponent {
  readonly compact = input(false);
  readonly kind = input<"empty" | "loading" | "error">("empty");
  readonly title = input<string>();
  readonly description = input<string>();
  readonly icon = input("empty-chat");
}
