/** @format */

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ButtonDirective, FieldDirective } from "@uilib";

@Component({
  selector: "app-expert-quota",
  imports: [ButtonDirective, FieldDirective, ReactiveFormsModule],
  template: `
    <div class="quota">
      <label for="evaluation-quota">{{ label() }}</label>
      <div class="quota__stepper">
        <input
          #field
          appField
          id="evaluation-quota"
          type="number"
          min="1"
          max="1000"
          step="1"
          inputmode="numeric"
          required
          [formControl]="control()"
          [readOnly]="busy()"
          [attr.aria-invalid]="changed() && control().invalid"
          [attr.aria-describedby]="changed() && control().invalid ? 'evaluation-quota-error' : null"
        />
        <div class="quota__steps">
          <button
            type="button"
            aria-label="Увеличить количество экспертов"
            [disabled]="busy() || (control().value ?? 0) >= 1000"
            (click)="step(field, 1)"
          ></button>
          <button
            type="button"
            aria-label="Уменьшить количество экспертов"
            [disabled]="busy() || (control().value ?? 1000) <= 1"
            (click)="step(field, -1)"
          ></button>
        </div>
      </div>
    </div>
    @if (changed()) {
      @if (control().invalid) {
        <p id="evaluation-quota-error" class="quota__error">Введите целое число от 1 до 1000.</p>
      }
      <ng-content />
      <div class="quota__actions">
        <button type="button" appButton="secondary" [disabled]="busy()" (click)="resetQuota.emit()">
          Сбросить
        </button>
        @if (previewReady()) {
          <button type="button" appButton="primary" [disabled]="busy()" (click)="save.emit()">
            Сохранить и пересчитать
          </button>
        } @else {
          <button
            type="button"
            appButton="secondary"
            [disabled]="busy() || control().invalid"
            (click)="preview.emit()"
          >
            Посмотреть изменения
          </button>
        }
      </div>
    }
  `,
  styleUrls: [
    "../program-native-button.scss",
    "../program-native-field.scss",
    "./expert-quota.component.scss",
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpertQuotaComponent {
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<number | null>>();
  readonly changed = input.required<boolean>();
  readonly busy = input.required<boolean>();
  readonly previewReady = input.required<boolean>();
  readonly preview = output<void>();
  readonly save = output<void>();
  readonly resetQuota = output<void>();

  step(field: HTMLInputElement, direction: number): void {
    field.stepUp(direction);
    if (Number.isFinite(field.valueAsNumber)) this.control().setValue(field.valueAsNumber);
  }
}
