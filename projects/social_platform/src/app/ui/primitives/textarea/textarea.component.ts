/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  input,
  model,
  output,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { AutosizeModule } from "ngx-autosize";
import { TooltipComponent } from "../tooltip/tooltip.component";
import { NgStyle } from "@angular/common";
import { IconComponent } from "../icon/icon.component";

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextareaComponent),
            multi: true,
        },
    ],
    imports: [AutosizeModule, IconComponent, TooltipComponent, NgStyle]
})
export class TextareaComponent implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  /** Текст подсказки */
  placeholder = input("");

  /** Тип поля (наследуется от базового компонента) */
  type = input<"text" | "password" | "email">("text");

  /** Наличие подсказки */
  haveHint = input(false);

  /** Текст для подсказки */
  tooltipText = input<string>();

  /** Позиция подсказки */
  tooltipPosition = input<"left" | "right">("right");

  /** Ширина подсказки */
  tooltipWidth = input(250);

  maxLength = input<number>();

  /** Состояние ошибки */
  error = input(false);

  size = input<"small" | "big">("small");

  /** Маска (наследуется, но не используется) */
  mask = input("");

  /** Двустороннее связывание текста */
  text = model("");

  /** Событие изменения текста */
  textChange = output<string>();

  /** Обработчик ввода текста */
  onInput(event: Event): void {
    const nextValue = (event.target as HTMLInputElement).value ?? "";

    if (this.maxLength() && nextValue.length > this.maxLength()!) {
      this.isLengthOverflow = true;
    } else {
      this.isLengthOverflow = false;
    }

    this.value = nextValue;
    this.onChange(nextValue);
    this.text.set(nextValue);
  }

  /** Обработчик потери фокуса */
  onBlur(): void {
    this.onTouch();
  }

  /** Текущее значение поля */
  value = "";

  /** Состояние видимости подсказки */
  isTooltipVisible = false;
  isLengthOverflow = false;

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
    this.value = value ?? "";
    this.text.set(this.value);
    this.cdr.markForCheck();
    this.isLengthOverflow = false;
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
    this.cdr.markForCheck();
  }

  /** Предотвращение перехода на новую строку по Enter */
  preventEnter(event: Event) {
    event.preventDefault();
  }
}
