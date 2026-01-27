/** @format */

import { CommonModule } from "@angular/common";
import { Component, EventEmitter, forwardRef, Input, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconComponent } from "@ui/components";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { NgxMaskModule } from "ngx-mask";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatNativeDateModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";

@Component({
  selector: "app-input",
  templateUrl: "./input.component.html",
  styleUrl: "./input.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [
    CommonModule,
    NgxMaskModule,
    IconComponent,
    TooltipComponent,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatFormFieldModule,
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() placeholder = "";
  @Input() type: "text" | "password" | "email" | "tel" | "date" | "radio" = "text";
  @Input() size: "small" | "big" = "small";
  @Input() hasBorder = true;
  @Input() haveHint = false;
  @Input() tooltipText?: string;
  @Input() tooltipPosition: "left" | "right" = "right";
  @Input() tooltipWidth = 250;
  @Input() error = false;
  @Input() mask = "";
  @Input() name = "";
  @Input() checked = false;
  @Input() maxLength?: number;

  @Input()
  set appValue(value: string | null) {
    this.value = value ?? "";
  }

  get appValue(): string {
    return this.value;
  }

  isTooltipVisible = false;
  isLengthOverflow = false;

  @Output() appValueChange = new EventEmitter<string>();
  @Output() enter = new EventEmitter<void>();
  @Output() change = new EventEmitter<Event>();

  /** Обработчик для radвариант io */
  onRadioChange(event: Event): void {
    if (this.type === "radio") {
      const target = event.target as HTMLInputElement;
      this.value = target.value;
      this.onChange(this.value);
      this.appValueChange.emit(this.value);
      this.change.emit(event);
      this.onTouch();
    }
  }

  /** Обработчик изменения даты в datepicker */
  onDateChange(event: any): void {
    if (this.type === "date" && event.value) {
      const date = event.value as Date;

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      this.value = formattedDate;
      this.onChange(formattedDate);
      this.appValueChange.emit(formattedDate);
      this.onTouch();
    }
  }

  showTooltip(): void {
    this.isTooltipVisible = true;
  }

  hideTooltip(): void {
    this.isTooltipVisible = false;
  }

  onInput(event: Event): void {
    const nextValue = (event.target as HTMLInputElement).value ?? "";

    this.isLengthOverflow = !!this.maxLength && nextValue.length > this.maxLength;

    this.value = nextValue;
    this.onChange(nextValue);
    this.appValueChange.emit(nextValue);
  }

  onBlur(): void {
    this.onTouch();
  }

  value = "";

  // Геттер для преобразования строковой даты в объект Date для datepicker
  get dateValue(): Date | null {
    if (!this.value || this.type !== "date") return null;

    const parts = this.value.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }

    return null;
  }

  get showErrorIcon(): boolean {
    if (this.error && !this.maxLength) {
      return true;
    }

    return false;
  }

  writeValue(value: string | null): void {
    setTimeout(() => {
      this.value = value ?? "";
    });
  }

  onChange: (value: string) => void = () => {};

  registerOnChange(fn: (v: string) => void): void {
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

  onEnter(event: Event) {
    event.preventDefault();
    this.enter.emit();
  }
}
