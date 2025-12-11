/** @format */

import { Component, forwardRef, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconComponent } from "@ui/components";
import { noop } from "rxjs";

/**
 * Компонент булевого критерия оценки (чекбокс)
 *
 * Функциональность:
 * - Отображает чекбокс для булевых критериев оценки
 * - Поддерживает кастомный дизайн с иконкой галочки
 * - Реализует ControlValueAccessor для интеграции с Angular Forms
 * - Обрабатывает клики как по чекбоксу, так и по всей области
 * - Поддержка отключенного состояния
 *
 * Входные параметры:
 * @Input disabled - флаг отключенного состояния (по умолчанию false)
 *
 * Внутренние свойства:
 * - isChecked - текущее состояние чекбокса (true/false)
 * - onChange - функция обратного вызова для уведомления об изменениях
 * - onTouched - функция обратного вызова для уведомления о касании
 *
 * Методы ControlValueAccessor:
 * - writeValue - установка значения извне
 * - registerOnChange - регистрация обработчика изменений
 * - registerOnTouched - регистрация обработчика касания
 * - setDisabledState - установка отключенного состояния
 *
 * Обработчики событий:
 * - onChanged - обработка изменения состояния через input[type="checkbox"]
 * - onClickLog - обработка клика по всей области компонента
 */
@Component({
  selector: "app-boolean-criterion",
  templateUrl: "./boolean-criterion.component.html",
  styleUrl: "./boolean-criterion.component.scss",
  standalone: true,
  imports: [IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooleanCriterionComponent),
      multi: true,
    },
  ],
})
export class BooleanCriterionComponent implements ControlValueAccessor {
  @Input() disabled = false;

  isChecked = false;
  onChange: (val: boolean) => void = noop;
  onTouched: () => void = noop;

  writeValue(val: boolean): void {
    this.isChecked = val;
  }

  registerOnChange(fn: (v: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Обработчик изменения состояния чекбокса
   * Вызывается при клике непосредственно по input[type="checkbox"]
   */
  onChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this.isChecked = target && target.checked;
    this.onChange(this.isChecked);
    this.onTouched();
  }

  /**
   * Обработчик клика по всей области компонента
   * Переключает состояние чекбокса при клике в любом месте компонента
   */
  onClickLog() {
    this.isChecked = !this.isChecked;
  }
}
