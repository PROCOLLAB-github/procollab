/** @format */

import { ChangeDetectionStrategy, Component, input, signal } from "@angular/core";
@Component({
  selector: "app-vacancy-letter",
  template: `
    <p class="letter" [class.letter--collapsed]="!expanded() && text().length > 500">
      {{ text().trim() || "Сопроводительное письмо не добавлено" }}
    </p>
    @if (text().length > 500) {
      <button
        type="button"
        class="letter__toggle"
        [attr.aria-expanded]="expanded()"
        (click)="expanded.set(!expanded())"
      >
        {{ expanded() ? "Свернуть" : "Показать полностью" }}
      </button>
    }
  `,
  styleUrl: "./vacancy-letter.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacancyLetterComponent {
  readonly text = input("");
  readonly expanded = signal(false);
}
