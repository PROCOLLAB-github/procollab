/** @format */

import { ChangeDetectorRef, Component, forwardRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NgxMaskModule } from "ngx-mask";

/**
 * Компонент для ввода диапазона значений с двумя ползунками.
 * Реализует ControlValueAccessor для интеграции с Angular Forms.
 * Позволяет выбрать минимальное и максимальное значение в диапазоне.
 *
 * Возвращает:
 * - Кортеж [number, number] с минимальным и максимальным значениями
 *
 * Функциональность:
 * - Два связанных ползунка для выбора диапазона
 * - Автоматическое обновление значений при изменении
 * - Поддержка маски ввода через NgxMask
 */
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

  /** Обработчик изменения левого ползунка (минимальное значение) */
  onInputLeft(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;

    const value = target.value;
    this.value[0] = Number.parseInt(value);
    this.onChange([Number.parseInt(value), this.value[1]]);
  }

  /** Обработчик изменения правого ползунка (максимальное значение) */
  onInputRight(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;

    const value = target.value;
    this.value[1] = Number.parseInt(value);
    this.onChange([this.value[0], Number.parseInt(value)]);
  }

  /** Обработчик потери фокуса */
  onBlur(): void {
    this.onTouch();
  }

  /** Текущее значение диапазона [мин, макс] */
  value: [number, number] = [0, 0];

  // Методы ControlValueAccessor
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

  /** Состояние блокировки */
  disabled = false;

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}
