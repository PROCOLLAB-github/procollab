/** @format */

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { IconComponent } from "../../primitives/icon/icon.component";
import { ButtonDirective } from "../../primitives/button/button.directive";

@Component({
  selector: "app-dialog-header",
  imports: [IconComponent, ButtonDirective],
  template: `<header class="dialog-header">
    <h2 [id]="titleId()">{{ title() }}</h2>
    @if (closable()) {
      <button appButton="icon" type="button" aria-label="Закрыть" (click)="closed.emit()">
        <i appIcon icon="cross" appSquare="16" aria-hidden="true"></i>
      </button>
    }
  </header>`,
  styles: `
    .dialog-header {
      display: flex;
      gap: var(--ui-space-md);
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--ui-space-md);
    }
    h2 {
      font-size: var(--ui-font-h2);
      font-weight: 600;
      line-height: 1.4;
      color: var(--ui-text);
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogHeaderComponent {
  readonly title = input.required<string>();
  readonly titleId = input<string>();
  readonly closable = input(true);
  readonly closed = output<void>();
}
