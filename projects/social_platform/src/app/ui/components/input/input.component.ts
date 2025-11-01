/** @format */

import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconComponent } from "@ui/components";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
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
 * - haveHint: наличие подсказки
 * - tooltipText: текст подсказки
 * - tooltipPosition: позиция подсказки
 * - checked: состояние для радио-кнопок
 * - name: имя для радио-кнопок
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
  imports: [CommonModule, NgxMaskModule, IconComponent, TooltipComponent],
})
export class InputComponent implements ControlValueAccessor {
  constructor() {}

  /** Текст подсказки */
  @Input() placeholder = "";

  /** Тип поля ввода */
  @Input() type: "text" | "password" | "email" | "tel" | "date" | "radio" = "text";

  /** Размер поля ввода */
  @Input() size: "small" | "big" = "small";

  /** Наличие обводки */
  @Input() hasBorder = true;

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

  /** Маска для форматирования */
  @Input() mask = "";

  /** Имя для инпута типа radio */
  @Input() name = "";

  /** Состояние checked для радио-кнопок */
  @Input() checked = false;

  /** Двустороннее связывание значения */
  @Input()
  set appValue(value: string) {
    this.value = value;
  }

  get appValue(): string {
    return this.value;
  }

  /** Состояние видимости подсказки */
  isTooltipVisible = false;

  /** Событие изменения значения */
  @Output() appValueChange = new EventEmitter<string>();

  /** Событие нажатия Enter */
  @Output() enter = new EventEmitter<void>();

  /** Событие изменения состояния радио (для внешних обработчиков) */
  @Output() change = new EventEmitter<Event>();

  /** Обработчик для радио */
  onRadioChange(event: Event): void {
    if (this.type === "radio") {
      const target = event.target as HTMLInputElement;
      this.value = target.value;
      this.onChange(this.value);
      this.appValueChange.emit(this.value);
      this.change.emit(event); // Эмитим событие для внешних обработчиков
      this.onTouch();
    }
  }

  /** Показать подсказку */
  showTooltip(): void {
    this.isTooltipVisible = true;
  }

  /** Скрыть подсказку */
  hideTooltip(): void {
    this.isTooltipVisible = false;
  }

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
