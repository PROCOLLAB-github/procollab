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
      <button
        class="dialog-header__close"
        appButton="icon"
        type="button"
        [attr.aria-label]="closeLabel()"
        [disabled]="closeDisabled()"
        [attr.cdkFocusInitial]="initialFocus() ? '' : null"
        (click)="closed.emit()"
      >
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
      margin-bottom: var(--ui-dialog-header-margin-bottom, var(--ui-space-md));
    }
    .dialog-header__close.ui-button {
      box-sizing: border-box;
      display: inline-flex;
      flex: 0 0 32px;
      align-items: center;
      justify-content: center;
      width: 32px;
      min-width: 32px;
      height: 32px;
      min-height: 32px;
      padding: 8px;
      color: var(--ui-text);
      cursor: pointer;
      background: transparent;
      border: 0;
      border-radius: 50%;
    }
    .dialog-header__close:focus-visible {
      outline: 2px solid var(--accent-dark);
      outline-offset: 3px;
    }
    .dialog-header__close:disabled {
      cursor: not-allowed;
      opacity: var(--ui-disabled-opacity);
    }
    @media (max-width: 999px) {
      .dialog-header__close.ui-button {
        flex-basis: 44px;
        width: 44px;
        min-width: 44px;
        height: 44px;
        min-height: 44px;
      }
    }
    h2 {
      min-width: 0;
      margin: 0;
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
  readonly closeLabel = input("Закрыть");
  readonly closeDisabled = input(false);
  readonly initialFocus = input(false);
  readonly closed = output<void>();
}
