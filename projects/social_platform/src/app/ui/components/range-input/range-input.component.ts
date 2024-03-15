/** @format */

import { ChangeDetectorRef, Component, forwardRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NgxMaskModule } from "ngx-mask";

@Component({
  selector: "app-range-input",
  standalone: true,
  imports: [CommonModule, NgxMaskModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeInputComponent),
      multi: true,
    },
  ],
  templateUrl: "./range-input.component.html",
  styleUrl: "./range-input.component.scss",
})
export class RangeInputComponent implements ControlValueAccessor {
  constructor(private readonly cdref: ChangeDetectorRef) {}

  onInputLeft(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;

    const value = target.value;
    this.value[0] = parseInt(value);
    this.onChange([parseInt(value), this.value[1]]);
  }

  onInputRight(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;

    const value = target.value;
    this.value[1] = parseInt(value);
    this.onChange([this.value[0], parseInt(value)]);
  }

  onBlur(): void {
    this.onTouch();
  }

  value: [number, number] = [0, 0];

  writeValue(value: [number, number]): void {
    setTimeout(() => {
      this.value = value;

      this.cdref.detectChanges();
    });
  }

  onChange: (value: [number, number]) => void = () => {};

  registerOnChange(fn: (v: [number, number]) => void): void {
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
}
