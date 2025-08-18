/** @format */

import { ChangeDetectorRef, Component, forwardRef, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

/**
 * Компонент поля ввода для числовых критериев с ограничением диапазона
 *
 * Функциональность:
 * - Поле ввода числовых значений с ограничением максимального значения
 * - Автоматическое ограничение значения при потере фокуса
 * - Блокировка ввода недопустимых символов (e, E, +, -)
 * - Предотвращение вставки нечисловых символов
 * - Реализует ControlValueAccessor для интеграции с Angular Forms
 * - Поддержка состояния ошибки для стилизации
 * - Автоматическое позиционирование курсора в конец при фокусе
 *
 * Входные параметры:
 * @Input max - максимальное допустимое значение (по умолчанию 10)
 * @Input error - флаг состояния ошибки для стилизации
 *
 * Внутренние свойства:
 * - value - текущее значение поля (number | null)
 * - disabled - флаг отключенного состояния
 *
 * Особенности:
 * - Переключение типа input с number на text для корректного позиционирования курсора
 * - Валидация значения при потере фокуса с автоматической коррекцией
 * - Блокировка ввода экспоненциальной записи и знаков
 */
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

  /**
   * Обработчик ввода значения
   * Парсит введенное значение и уведомляет о изменении
   */
  onInput(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;
    const value = target.value ? Number.parseInt(target.value) : null;

    this.value = value;
    this.onChange(value);
  }

  /**
   * Обработчик вставки из буфера обмена
   * Блокирует вставку нечисловых символов
   */
  onPaste(event: ClipboardEvent): void {
    const pasteData = event.clipboardData?.getData("text/plain");
    if (pasteData && pasteData.match(/[^0-9]/)) {
      event.preventDefault();
    }
  }

  /**
   * Обработчик нажатия клавиш
   * Блокирует ввод с��мволов экспоненциальной записи и знаков
   */
  onKeydown(event: KeyboardEvent): void {
    if (["e", "E", "+", "-"].some(char => event.key === char)) {
      event.preventDefault();
    }
  }

  /**
   * Обработчик потери фокуса
   * Ограничивает значение максимумом и уведомляет о касании
   */
  onBlur(): void {
    if (this.value) {
      const val = Math.min(this.value, this.max);

      this.value = val;
      this.onChange(val);
    }
    this.onTouch();
  }

  // Методы ControlValueAccessor
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

  /**
   * Перемещение курсора в конец поля при фокусе
   * Временно меняет тип поля для корректного позиционирования
   */
  moveCursorToEnd(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.type = "text";
    input.selectionStart = input.selectionEnd = input.value.length;
    input.type = "number";
  }
}
