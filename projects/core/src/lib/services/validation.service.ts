/** @format */

import { Injectable } from "@angular/core";
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import * as dayjs from "dayjs";
import * as cpf from "dayjs/plugin/customParseFormat";
import * as relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(cpf);
dayjs.extend(relativeTime);

/**
 * Сервис для кастомной валидации форм
 *
 * Предоставляет набор специализированных валидаторов для:
 * - Проверки совпадения полей (пароли, email подтверждения)
 * - Валидации дат и возраста
 * - Проверки языка ввода (русский/латиница)
 * - Утилиты для работы с формами
 *
 * Особенности:
 * - Все валидаторы возвращают ValidatorFn для использования в Angular Forms
 * - Поддержка русской локализации для дат
 * - Интеграция с dayjs для работы с датами
 * - Автоматическое управление состоянием ошибок в контролах
 */
@Injectable({
  providedIn: "root",
})
export class ValidationService {
  constructor() {}

  /**
   * Создает валидатор для проверки совпадения двух полей формы
   * @param left - Имя первого поля для сравнения
   * @param right - Имя второго поля для сравнения
   * @returns ValidatorFn для использования на уровне FormGroup
   *
   * Применение:
   * - Проверка совпадения пароля и подтверждения пароля
   * - Проверка совпадения email и подтверждения email
   *
   * Логика работы:
   * 1. Получает контролы по именам полей
   * 2. Сравнивает их значения
   * 3. Если не совпадают - устанавливает ошибку 'unMatch' для обоих контролов
   * 4. Если совпадают - удаляет ошибку 'unMatch'
   *
   * Пример использования:
   * this.form = this.fb.group({
   *   password: ['', Validators.required],
   *   confirmPassword: ['', Validators.required]
   * }, {
   *   validators: this.validationService.useMatchValidator('password', 'confirmPassword')
   * });
   */
  useMatchValidator(left: string, right: string): ValidatorFn {
    return group => {
      const controls = [group.get(left), group.get(right)];

      // Проверяем существование контролов
      if (!controls.every(Boolean)) {
        throw new Error(`No control with name ${left} or ${right}`);
      }

      const isMatching = controls[0]?.value === controls[1]?.value;

      if (!isMatching) {
        // Устанавливаем ошибку для обоих контролов
        controls.forEach(c => c?.setErrors({ ...(c.errors || {}), unMatch: true }));
        return { unMatch: true };
      }

      // Удаляем ошибку если поля совпадают
      controls.forEach(c => {
        if (c?.errors) {
          delete c.errors?.["unMatch"];
          // Если других ошибок нет, очищаем errors полностью
          if (!Object.keys(c.errors).length) {
            c.setErrors(null);
          }
        }
      });

      return null;
    };
  }

  /**
   * Валидатор для проверки формата даты DD.MM.YYYY
   * @param control - Контрол формы для валидации
   * @returns ValidationErrors с ошибкой 'invalidDateFormat' или null
   *
   * Проверки:
   * - Соответствие формату DD.MM.YYYY (строгая проверка)
   * - Дата не должна быть в будущем
   * - Дата должна быть валидной (существующей)
   *
   * Пример использования:
   * birthday: ['', [Validators.required, this.validationService.useDateFormatValidator]]
   */
  useDateFormatValidator(control: AbstractControl): ValidationErrors | null {
    try {
      // Строгая проверка формата DD.MM.YYYY
      const value = dayjs(control.value, "DD.MM.YYYY", true);

      // Проверяем что дата не в будущем и валидна
      if (control.value && (value.fromNow().includes("in") || !value.isValid())) {
        return { invalidDateFormat: true };
      }

      return null;
    } catch (e) {
      return { invalidDateFormat: true };
    }
  }

  /**
   * Создает валидатор для проверки минимального возраста
   * @param age - Минимальный возраст в годах (по умолчанию 12)
   * @returns ValidatorFn для проверки возраста
   *
   * Применение:
   * - Проверка совершеннолетия
   * - Ограничения по возрасту для регистрации
   * - Валидация даты рождения
   *
   * Логика:
   * 1. Парсит дату в формате DD.MM.YYYY
   * 2. Вычисляет разность в годах с текущей датой
   * 3. Сравнивает с требуемым минимальным возрастом
   *
   * Пример использования:
   * birthday: ['', [
   *   Validators.required,
   *   this.validationService.useDateFormatValidator,
   *   this.validationService.useAgeValidator(18) // минимум 18 лет
   * ]]
   */
  useAgeValidator(age = 14): ValidatorFn {
    return control => {
      const value = dayjs(control.value, "DD.MM.YYYY", true);

      if (value.isValid()) {
        const difference = dayjs().diff(value, "year");
        return difference >= age ? null : { tooYoung: { requiredAge: age } };
      }

      return null;
    };
  }

  /**
   * Валидатор для проверки ввода только русских букв
   * @returns ValidatorFn для проверки русского языка
   *
   * Применение:
   * - Поля имени и фамилии
   * - Поля описания на русском языке
   * - Любые текстовые поля, где требуется только кириллица
   *
   * Проверяет соответствие регулярному выражению: ^[А-Яа-я]*$
   * - Разрешены только русские буквы (заглавные и строчные)
   * - Пробелы и другие символы не разрешены
   *
   * Пример использования:
   * firstName: ['', [
   *   Validators.required,
   *   this.validationService.useLanguageValidator()
   * ]]
   */
  useLanguageValidator(): ValidatorFn {
    return control => {
      return control.value.match(/^[А-Яа-я]*$/g) ? null : { invalidLanguage: true };
    };
  }

  /**
   * Утилита для валидации всей формы с отображением ошибок
   * @param form - FormGroup для валидации
   * @returns true если форма валидна, false если есть ошибки
   *
   * Функциональность:
   * 1. Проверяет общую валидность формы
   * 2. Если форма невалидна - помечает все контролы как 'touched'
   * 3. Это приводит к отображению ошибок в UI
   *
   * Применение:
   * - При отправке формы
   * - При переходе между шагами многошаговой формы
   * - При программной валидации
   *
   * Пример использования:
   * onSubmit() {
   *   if (this.validationService.getFormValidation(this.form)) {
   *     // Форма валидна, можно отправлять
   *     this.submitForm();
   *   } else {
   *     // Форма невалидна, ошибки отображены пользователю
   *     console.log('Form has errors');
   *   }
   * }
   */
  getFormValidation(form: FormGroup): boolean {
    if (form.valid) {
      return true;
    }

    // Помечаем все контролы как touched для отображения ошибок
    Object.keys(form.controls).forEach(controlName => {
      const control = form.get(controlName);
      control && control.markAsTouched({ onlySelf: true });
    });

    return false;
  }
}
