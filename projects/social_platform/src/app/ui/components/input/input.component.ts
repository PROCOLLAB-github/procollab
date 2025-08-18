/** @format */

import { Component, EventEmitter, forwardRef, Input, type OnInit, Output } from "@angular/core";
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconComponent } from "@ui/components";
import { NgxMaskModule } from "ngx-mask";

/**
 * Компонент поля ввода с поддержкой масок и различных типов.
 * Реализует ControlValueAccessor для интеграции с Angular Forms.
 *
 * Входящие параметры:
 * - placeholder: текст подсказки в поле
 * - type: тип поля ввода ("text" | "password" | "email" | "tel")
 * - error: состояние ошибки для стилизации
 * - mask: маска для форматирования ввода
 * - appValue: значение поля (двустороннее связывание)
 *
 * События:
 * - appValueChange: изменение значения поля
 * - enter: нажатие клавиши Enter
 *
 * Возвращает:
 * - Введенное значение через ControlValueAccessor
 */
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
  imports: [NgxMaskModule, IconComponent],
})
export class InputComponent implements OnInit, ControlValueAccessor {
  constructor() {}

  /** Текст подсказки */
  @Input() placeholder = "";

  /** Тип поля ввода */
  @Input() type: "text" | "password" | "email" | "tel" = "text";

  /** Состояние ошибки */
  @Input() error = false;

  /** Маска для форматирования */
  @Input() mask = "";

  /** Двустороннее связывание значения */
  @Input()
  set appValue(value: string) {
    this.value = value;
  }

  get appValue(): string {
    return this.value;
  }

  /** Событие изменения значения */
  @Output() appValueChange = new EventEmitter<string>();

  /** Событие нажатия Enter */
  @Output() enter = new EventEmitter<void>();

  ngOnInit(): void {}

  /** Обработчик ввода текста */
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onChange(value);
    this.appValueChange.emit(value);
  }

  /** Обработчик потери фокуса */
  onBlur(): void {
    this.onTouch();
  }

  /** Текущее значение поля */
  value = "";

  // Методы ControlValueAccessor
  writeValue(value: string): void {
    setTimeout(() => {
      this.value = value;
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

  /** Состояние блокировки */
  disabled = false;

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  /** Обработчик нажатия Enter */
  onEnter(event: Event) {
    event.preventDefault();
    this.enter.emit();
  }
}
