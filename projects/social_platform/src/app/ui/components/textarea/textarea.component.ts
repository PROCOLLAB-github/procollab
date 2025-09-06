/** @format */

import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconComponent } from "@uilib";
import { AutosizeModule } from "ngx-autosize";
import { TooltipComponent } from "../tooltip/tooltip.component";

/**
 * Компонент многострочного поля ввода с автоматическим изменением размера.
 * Реализует ControlValueAccessor для интеграции с Angular Forms.
 * Автоматически подстраивает высоту под содержимое.
 *
 * Входящие параметры:
 * - placeholder: текст подсказки в поле
 * - type: тип поля (наследуется от input, но используется как textarea)
 * - error: состояние ошибки для стилизации
 * - mask: маска для форматирования (наследуется, но не используется)
 * - text: значение текста (двустороннее связывание)
 *
 * События:
 * - textChange: изменение текста в поле
 *
 * Возвращает:
 * - Введенный многострочный текст через ControlValueAccessor
 */
@Component({
  selector: "app-textarea",
  templateUrl: "./textarea.component.html",
  styleUrl: "./textarea.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [AutosizeModule, IconComponent, TooltipComponent],
})
export class TextareaComponent implements OnInit, ControlValueAccessor {
  /** Текст подсказки */
  @Input() placeholder = "";

  /** Тип поля (наследуется от базового компонента) */
  @Input() type: "text" | "password" | "email" = "text";

  /** Наличие подсказки */
  @Input() haveHint = false;

  /** Текст для подсказки */
  @Input() tooltipText?: string;

  /** Позиция подсказки */
  @Input() tooltipPosition: "left" | "right" = "right";

  /** Ширина подсказки */
  @Input() tooltipWidth = 250;

  /** Состояние ошибки */
  @Input() error = false;

  @Input() size: "small" | "big" = "small";

  /** Маска (наследуется, но не используется) */
  @Input() mask = "";

  /** Двустороннее связывание текста */
  @Input() set text(value: string) {
    this.value = value;
  }

  get text(): string {
    return this.value;
  }

  /** Событие изменения текста */
  @Output() textChange = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}

  /** Обработчик ввода текста */
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onChange(value);
    this.textChange.emit(value);
  }

  /** Обработчик потери фокуса */
  onBlur(): void {
    this.onTouch();
  }

  /** Текущее значение поля */
  value = "";

  /** Состояние видимости подсказки */
  isTooltipVisible = false;

  /** Показать подсказку */
  showTooltip(): void {
    this.isTooltipVisible = true;
  }

  /** Скрыть подсказку */
  hideTooltip(): void {
    this.isTooltipVisible = false;
  }

  // Методы ControlValueAccessor
  writeValue(value: string): void {
    this.value = value;
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

  /** Предотвращение перехода на новую строку по Enter */
  preventEnter(event: Event) {
    event.preventDefault();
  }
}
