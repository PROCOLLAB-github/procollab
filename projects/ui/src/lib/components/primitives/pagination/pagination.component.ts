/** @format */

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { ButtonDirective } from "../button/button.directive";

@Component({
  selector: "app-pagination",
  imports: [ButtonDirective],
  template: `<nav class="pagination" aria-label="Страницы">
    <button
      type="button"
      appButton="secondary"
      [disabled]="previousDisabled() || loading()"
      (click)="previous.emit()"
    >
      {{ previousLabel() }}
    </button>
    <span aria-live="polite"><ng-content /></span>
    <button
      type="button"
      appButton="secondary"
      [disabled]="nextDisabled() || loading()"
      (click)="next.emit()"
    >
      {{ nextLabel() }}
    </button>
  </nav>`,
  styles: `
    .pagination {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ui-space-sm);
      align-items: center;
      justify-content: flex-end;
      margin-top: var(--ui-space-md);
      font-size: var(--ui-font-small);
      color: var(--ui-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly previousDisabled = input(false);
  readonly nextDisabled = input(false);
  readonly loading = input(false);
  readonly previousLabel = input("Назад");
  readonly nextLabel = input("Далее");
  readonly previous = output<void>();
  readonly next = output<void>();
}
