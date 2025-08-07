/** @format */

import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconComponent } from "@ui/components";
import { ClickOutsideModule } from "ng-click-outside";

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
 * - openable: возможность сворачивания ��оля (по умолчанию true)
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [ClickOutsideModule, IconComponent],
})
export class SearchComponent implements OnInit, ControlValueAccessor {
  /** Текст подсказки */
  @Input() placeholder = "";

  /** Тип поля ввода */
  @Input() type: "text" | "password" | "email" = "text";

  /** Состояние ошибки */
  @Input() error = false;

  /** Маска для форматирования */
  @Input() mask = "";

  /** Возможность сворачивания поля */
  @Input() openable = true;

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

  ngOnInit(): void {
    this.open = !this.openable;
  }

  /** Ссылка на поле ввода */
  @ViewChild("inputEl") inputEl?: ElementRef<HTMLInputElement>;

  /** Состояние раскрытия поля */
  open = false;

  /** Переключение состояния раскрытия поля поиска */
  onSwitchSearch(value: boolean): void {
    if (this.openable) this.open = value;

    if (value) {
      setTimeout(() => {
        this.inputEl?.nativeElement.focus();
      });
    }
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
