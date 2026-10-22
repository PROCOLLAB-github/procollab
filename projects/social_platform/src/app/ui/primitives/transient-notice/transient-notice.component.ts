/** @format */

import { ChangeDetectionStrategy, Component, Signal, effect, input, output } from "@angular/core";
import { AlertDirective, IconComponent } from "@uilib";

@Component({
  selector: "app-transient-notice",
  imports: [AlertDirective, IconComponent],
  template: `
    <div appAlert="success" class="notice">
      <span class="notice__text"><ng-content /></span>
      <button
        type="button"
        class="notice__close"
        aria-label="Закрыть уведомление"
        (click)="dismiss()"
      >
        <i appIcon icon="cross" appSquare="16" aria-hidden="true"></i>
      </button>
    </div>
  `,
  styleUrl: "./transient-notice.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransientNoticeComponent {
  // Signal с equal: () => false позволяет заново показать тот же результат действия.
  readonly source = input.required<Signal<unknown>>();
  readonly dismissed = output<void>();
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(onCleanup => {
      const value = this.source()();
      this.clearTimer();
      if (value) this.timer = setTimeout(() => this.dismiss(), 2000);
      onCleanup(() => this.clearTimer());
    });
  }

  dismiss(): void {
    this.clearTimer();
    this.dismissed.emit();
  }

  private clearTimer(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
  }
}
