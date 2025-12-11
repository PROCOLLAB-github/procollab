/** @format */

import { Pipe, type PipeTransform } from "@angular/core";
import type { AbstractControl, ValidationErrors } from "@angular/forms";

/**
 * Пайп для проверки ошибок валидации в контролах Angular Forms
 *
 * Назначение:
 * - Определяет, нужно ли показывать ошибку валидации в UI
 * - Проверяет состояние контрола (touched) и наличие ошибок
 * - Поддерживает проверку как общих ошибок, так и конкретных типов ошибок
 *
 * Логика отображения ошибок:
 * - Ошибка показывается только если контрол был "затронут" пользователем (touched)
 * - И при этом контрол содержит ошибки валидации (invalid)
 *
 * Применение в шаблонах:
 * - Условное отображение сообщений об ошибках
 * - Стилизация невалидных полей
 * - Показ конкретных типов ошибок
 */
@Pipe({
  name: "controlError",
  /**
   * pure: false - пайп пересчитывается при каждом change detection
   * Необходимо для корректной работы с динамическим состоянием форм
   * (touched, dirty, errors могут изменяться без изменения самого контрола)
   */
  pure: false,
  standalone: true,
})
export class ControlErrorPipe implements PipeTransform {
  /**
   * Проверяет, нужно ли отображать ошибку для контрола
   * @param value - AbstractControl (FormControl, FormGroup, FormArray)
   * @param errorName - Имя конкретной ошибки для проверки (опционально)
   * @returns true если ошибку нужно показать, false если нет
   *
   * Режимы работы:
   *
   * 1. Без errorName - проверка общей валидности:
   *    Возвращает true если контрол touched И invalid
   *
   * 2. С errorName - проверка конкретной ошибки:
   *    Возвращает true если контрол touched И содержит указанную ошибку
   *
   * Примеры использования в шаблоне:
   *
   * <!-- Показать любую ошибку -->
   * <div *ngIf="form.get('email') | controlError" class="error">
   *   Поле содержит ошибки
   * </div>
   *
   * <!-- Показать конкретную ошибку -->
   * <div *ngIf="form.get('email') | controlError:'required'" class="error">
   *   Поле обязательно для заполнения
   * </div>
   *
   * <div *ngIf="form.get('email') | controlError:'email'" class="error">
   *   Введите корректный email
   * </div>
   *
   * <!-- Условная стилизация -->
   * <input
   *   [class.invalid]="form.get('email') | controlError"
   *   formControlName="email">
   */
  transform(value: AbstractControl, errorName?: keyof ValidationErrors): boolean {
    if (!errorName) {
      // Режим 1: Проверка общей валидности контрола
      // Показываем ошибку если контрол был затронут И невалиден
      return value.touched && value.invalid;
    }

    // Режим 2: Проверка конкретной ошибки
    // Показываем ошибку если контрол был затронут И содержит указанную ошибку
    return value.touched && (value.errors ? value.errors[errorName] : false);
  }
}
