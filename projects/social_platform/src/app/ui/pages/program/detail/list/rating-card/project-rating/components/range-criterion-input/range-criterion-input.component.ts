/** @format */

import { FieldDirective } from "@uilib";
/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  input,
  Input,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

/** Поле ввода числовых критериев с ограничением диапазона и ControlValueAccessor. */
@Component({
  imports: [FieldDirective],
  selector: "app-range-criterion-input",
  templateUrl: "./range-criterion-input.component.html",
  styleUrl: "./range-criterion-input.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeCriterionInputComponent),
      multi: true,
    },
  ],
  standalone: true,
})
export class RangeCriterionInputComponent implements ControlValueAccessor {
  readonly max = input<number | null>(10);
  readonly min = input<number | null>(0);
  readonly step = input<number | "any">(1);
  readonly label = input<string>("Оценка");
  readonly error = input<boolean>(false);
  readonly compact = input(false);

  value!: number | null;

  constructor(private readonly cdref: ChangeDetectorRef) {}

  onInput(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;
    const value = target.value ? Number(target.value) : null;

    this.value = value;
    this.onChange(value);
  }

  onPaste(event: ClipboardEvent): void {
    const pasteData = event.clipboardData?.getData("text/plain");
    if (pasteData && !Number.isFinite(Number(pasteData))) {
      event.preventDefault();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (
      ["e", "E", "+"].includes(event.key) ||
      (event.key === "-" && this.min() !== null && this.min()! >= 0)
    ) {
      event.preventDefault();
    }
  }

  onBlur(): void {
    this.onTouch();
  }

  // Методы ControlValueAccessor
  writeValue(value: number): void {
    this.value = value ?? null;
    this.cdref.markForCheck();
  }

  onChange: (value: number | null) => void = () => {};

  registerOnChange(fn: (v: number | null) => void): void {
    this.onChange = fn;
  }

  onTouch: () => void = () => {};

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  disabled = false;

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.cdref.markForCheck();
  }
}
