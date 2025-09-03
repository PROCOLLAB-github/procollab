/** @format */

import { Injectable } from "@angular/core";
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { PasswordValidationErrors } from "@auth/models/password-errors.model";
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

      if (!controls.every(Boolean)) {
        throw new Error(`No control with name ${left} or ${right}`);
      }

      const isMatching = controls[0]?.value === controls[1]?.value;

      if (!isMatching) {
        controls.forEach(c => c?.setErrors({ ...(c.errors || {}), unMatch: true }));
        return { unMatch: true };
      }

      controls.forEach(c => {
        if (c?.errors) {
          delete c.errors?.["unMatch"];
          if (!Object.keys(c.errors).length) {
            c.setErrors(null);
          }
        }
      });

      return null;
    };
  }

  /**
   * Валидатор для проверки силы пароля
   *
   * Требования к паролю:
   * - Минимум 8 символов
   * - Минимум одна заглавная буква (A-Z)
   * - Минимум одна строчная буква (a-z)
   * - Минимум одна цифра (0-9)
   * - Минимум один специальный символ (!@#$%^&*()_+-=[]{}|;:,.<>?)
   * - Не должен содержать пробелы
   * - Не должен содержать последовательности типа "123456" или "abcdef"
   * - Не должен содержать повторяющиеся символы более 2 раз подряд
   */
  usePasswordValidator(minLength = 6): ValidatorFn {
    return (control: AbstractControl): PasswordValidationErrors | null => {
      const value: string = control.value;

      if (!value) {
        return null;
      }

      const errors: PasswordValidationErrors = {};

      if (value.length < minLength) {
        errors.passwordTooShort = {
          requiredLength: minLength,
          actualLength: value.length,
        };
      }

      if (!/[A-Z]/.test(value)) {
        errors.passwordNoUppercase = {
          message: "Пароль должен содержать минимум одну заглавную букву",
        };
      }

      if (!/[a-z]/.test(value)) {
        errors.passwordNoLowercase = {
          message: "Пароль должен содержать минимум одну строчную букву",
        };
      }

      if (!/[0-9]/.test(value)) {
        errors.passwordNoNumber = {
          message: "Пароль должен содержать минимум одну цифру",
        };
      }

      if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(value)) {
        errors.passwordNoSpecialChar = {
          message: "Пароль должен содержать минимум один специальный символ (!@#$%^&* и т.д.)",
        };
      }

      if (/\s/.test(value)) {
        errors.passwordHasSpaces = {
          message: "Пароль не должен содержать пробелы",
        };
      }

      if (this.hasSequence(value)) {
        errors.passwordHasSequence = {
          message: "Пароль не должен содержать последовательности символов",
        };
      }

      if (this.hasRepeatingChars(value)) {
        errors.passwordHasRepeating = {
          message: "Пароль не должен содержать более 2 одинаковых символов подряд",
        };
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  /**
   * Проверяет наличие последовательностей в пароле
   */
  private hasSequence(password: string): boolean {
    const sequences = [
      "01234567890",
      "09876543210",
      "abcdefghijklmnopqrstuvwxyz",
      "zyxwvutsrqponmlkjihgfedcba",
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      "ZYXWVUTSRQPONMLKJIHGFEDCBA",
      "qwertyuiopasdfghjklzxcvbnm",
      "йцукенгшщзхъфывапролджэячсмитьбю",
    ];

    const lowerPassword = password.toLowerCase();

    for (const sequence of sequences) {
      for (let i = 0; i <= sequence.length - 4; i++) {
        const subSequence = sequence.substring(i, i + 4);
        if (lowerPassword.includes(subSequence)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Проверяет наличие более 2 повторяющихся символов подряд
   */
  private hasRepeatingChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
        return true;
      }
    }
    return false;
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
      const value = dayjs(control.value, "DD.MM.YYYY", true);

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
      const difference = dayjs().diff(value, "year");

      const isInvalidDate = !value.isValid() || value.year() < 1900;
      const isTooYoung = difference < age;
      const isTooOld = difference > 100;

      return isInvalidDate
        ? { invalidDateFormat: { requiredAge: 100 } }
        : isTooYoung
        ? { tooYoung: { requiredAge: age } }
        : isTooOld
        ? { tooOld: { requiredAge: 100 } }
        : null;
    };
  }

  /**
   * Создает валидатор для проверки валидности полного email
   * @returns ValidatorFn для проверки возраста
   *
   * Применение:
   * - Проверка валидности
   * - Валидация полного email
   *
   * Логика:
   * 1. Создаем регулрку для email
   * 2. Тестируем подходит ли она нам
   *
   * Пример использования:
   * email: ['', [
   *   Validators.required,
   *   this.validationService.useEmailValidator()
   * ]]
   */
  useEmailValidator(): ValidatorFn {
    return control => {
      const value = control.value;
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (regex.test(value)) {
        return null;
      } else {
        return { invalidEmail: {} };
      }
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
