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
  styleUrls: ["../program-native-button.scss", "../program-native-field.scss"],
  styles: `
    :host {
      display: grid;
      gap: 8px;
      min-width: 0;
    }
    .quota,
    .quota__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 12px;
    }
    .quota {
      font-size: 14px;
      font-weight: 600;
    }
    .quota__stepper {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .quota__stepper input {
      box-sizing: border-box;
      width: 4rem;
      min-width: 0;
      padding-inline: 8px;
      appearance: textfield;
    }
    .quota__stepper input::-webkit-inner-spin-button,
    .quota__stepper input::-webkit-outer-spin-button {
      -webkit-appearance: none;
    }
    .quota__steps {
      display: grid;
      gap: 2px;
    }
    .quota__steps button {
      display: grid;
      width: 26px;
      height: 24px;
      place-items: center;
      padding: 0;
      border: 1px solid var(--light-gray);
      border-radius: 4px;
      background: var(--light-white);
      color: var(--accent-text);
    }
    .quota__steps button:not(:disabled) {
      cursor: pointer;
    }
    .quota__steps button:not(:disabled):hover {
      background: var(--light-gray);
    }
    .quota__steps button:disabled {
      opacity: 0.5;
    }
    .quota__steps button:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 1px;
    }
    .quota__steps button::before {
      width: 6px;
      height: 6px;
      border-right: 1.5px solid currentColor;
      border-bottom: 1.5px solid currentColor;
      transform: translateY(1.5px) rotate(225deg);
      content: "";
    }
    .quota__steps button:last-child::before {
      transform: translateY(-1.5px) rotate(45deg);
    }
    .quota__error {
      margin: 0;
      font-size: 12px;
    }
  `,
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
