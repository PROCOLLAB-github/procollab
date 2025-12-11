/** @format */

import { Pipe, type PipeTransform } from "@angular/core";
import type { AbstractControl, FormControl } from "@angular/forms";

/**
 * Пайп для приведения типа AbstractControl к FormControl
 *
 * Назначение:
 * - Решает проблему типизации в Angular Forms
 * - Позволяет использовать специфичные методы FormControl в шаблонах
 * - Устраняет необходимость в type assertion в компонентах
 *
 * Проблема:
 * FormGroup.get() возвращает AbstractControl | null, но часто мы знаем,
 * что это именно FormControl и хотим использовать его специфичные свойства
 *
 * Решение:
 * Пайп безопасно приводит AbstractControl к FormControl для использования в шаблонах
 *
 * Применение:
 * - Доступ к свойствам FormControl (value, valueChanges)
 * - Использование методов FormControl (setValue, patchValue)
 * - Типобезопасная работа с контролами в шаблонах
 */
@Pipe({
  name: "formControl",
  standalone: true,
})
export class FormControlPipe implements PipeTransform {
  /**
   * Приводит AbstractControl к типу FormControl
   * @param value - AbstractControl для приведения типа
   * @returns FormControl (приведенный тип)
   *
   * Важно: Этот пайп не выполняет проверку типа во время выполнения!
   * Он только сообщает TypeScript, что объект является FormControl.
   * Убедитесь, что передаваемый контрол действительно является FormControl.
   *
   * Примеры использования в шаблонах:
   *
   * <!-- Доступ к значению FormControl -->
   * <div>Текущее значение: {{ (form.get('email') | formControl).value }}</div>
   *
   * <!-- Подписка на изменения значения -->
   * <div *ngIf="(form.get('email') | formControl).valueChanges | async as emailValue">
   *   Email изменился: {{ emailValue }}
   * </div>
   *
   * <!-- Использование с другими пайпами -->
   * <input
   *   [value]="(form.get('email') | formControl).value | uppercase"
   *   (input)="(form.get('email') | formControl).setValue($event.target.value)">
   *
   * Альтернативный подход в компоненте:
   * get emailControl() {
   *   return this.form.get('email') as FormControl;
   * }
   *
   * Но пайп удобнее для одноразового использования в шаблонах.
   */
  transform(value: AbstractControl): FormControl {
    return value as FormControl;
  }
}
