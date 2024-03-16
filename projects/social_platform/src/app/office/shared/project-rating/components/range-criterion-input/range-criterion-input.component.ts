/** @format */

import { ChangeDetectorRef, Component, forwardRef, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "app-range-criterion-input",
  templateUrl: "./range-criterion-input.component.html",
  styleUrl: "./range-criterion-input.component.scss",
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
  @Input() max = 10;

  @Input() error = false;

  value!: number | null;

  constructor(private readonly cdref: ChangeDetectorRef) {}

  onInput(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;

    const value = target.value ? parseInt(target.value) : null;

    this.value = value;
    this.onChange(value);
  }

  onPaste(event: ClipboardEvent): void {
    const pasteData = event.clipboardData?.getData("text/plain");
    if (pasteData && pasteData.match(/[^0-9]/)) {
      event.preventDefault();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (["e", "E", "+", "-"].some(char => event.key === char)) {
      event.preventDefault();
    }
  }

  onBlur(): void {
    if (this.value) {
      const val = Math.min(this.value, this.max);

      this.value = val;
      this.onChange(val);
    }
    this.onTouch();
  }

  writeValue(value: number): void {
    setTimeout(() => {
      this.value = value;

      this.cdref.detectChanges();
    });
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
  }

  moveCursorToEnd(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.type = "text";
    input.selectionStart = input.selectionEnd = input.value.length;
    input.type = "number";
  }
}
