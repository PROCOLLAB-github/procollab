/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  output,
  viewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ClickOutsideModule } from "ng-click-outside";
import { IconComponent } from "../icon/icon.component";

/**
 * Компонент поля поиска с возможностью раскрытия/сворачивания.
 * Реализует ControlValueAccessor для интеграции с Angular Forms.
 * Может работать в режиме всегда открытого поля или с анимацией раскрытия.
 *
 * Входящие параметры:
 * - placeholder: текст подсказки в поле
 * - type: тип поля ввода ("text" | "password" | "email")
 * - error: состояние ошибки для стилизации
 * - mask: маска для форматирования ввода
 * - openable: возможность сворачивания поля (по умолчанию true)
 * - appValue: значение поля (двустороннее связывание)
 *
 * События:
 * - appValueChange: изменение значения поля
 * - enter: нажатие клавиши Enter
 *
 * Возвращает:
 * - Введенный текст поиска через ControlValueAccessor
 */
@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrl: "./search.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchComponent),
      multi: true,
    },
  ],
  imports: [ClickOutsideModule, IconComponent],
})
export class SearchComponent implements ControlValueAccessor {
  /** Текст подсказки */
  placeholder = input("");

  /** Тип поля ввода */
  type = input<"text" | "password" | "email">("text");

  /** Состояние ошибки */
  error = input(false);

  /** Маска для форматирования */
  mask = input("");

  /** Возможность сворачивания поля */
  openable = input(true);

  /** Двустороннее связывание значения */
  appValue = model("");

  /** Событие нажатия Enter */
  enter = output<void>();

  /** Ссылка на поле ввода */
  inputEl = viewChild<ElementRef<HTMLInputElement>>("inputEl");

  /** Состояние раскрытия поля */
  open = false;
  private readonly cdRef = inject(ChangeDetectorRef);

  constructor() {
    this.open = !this.openable();
  }

  /** Переключение состояния раскрытия поля поиска */
  onSwitchSearch(value: boolean): void {
    if (this.openable()) this.open = value;

    if (value) {
      setTimeout(() => {
        this.inputEl()?.nativeElement.focus();
        this.cdRef.markForCheck();
      });
    }
  }

  /** Обработчик ввода текста */
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onChange(value);
    this.appValue.set(value);
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
      this.appValue.set(value);
      this.cdRef.markForCheck();
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

  /** Остановка всплытия события */
  stopPropagation(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /** Обработчик клика вне поля - сворачивает поиск */
  onClickOutside(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    this.onSwitchSearch(false);
  }
}
