/** @format */

import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

/**
 * @fileoverview Валидатор для проверки диапазона годов в Angular формах
 *
 * Этот модуль предоставляет функцию-валидатор для Angular форм, которая проверяет,
 * что год начала меньше или равен году окончания.
 *
 * @param {string} entryYearValue - Имя контрола формы, содержащего год начала
 * @param {string} completionYearValue - Имя контрола формы, содержащего год окончания
 * @returns {ValidatorFn} - Функция-валидатор для Angular формы
 *
 * Принцип работы:
 * 1. Получает значения контролов года начала и года окончания из формы
 * 2. Проверяет, что оба значения существуют и не null
 * 3. Сравнивает значения и возвращает ошибку, если год начала больше года окончания
 * 4. Возвращает null, если валидация прошла успешно
 *
 * Пример использования:
 * this.form = this.fb.group({
 *   entryYear: [null],
 *   completionYear: [null]
 * }, { validators: yearRangeValidators('entryYear', 'completionYear') });
 */
export const yearRangeValidators = (
  entryYearValue: string,
  completionYearValue: string
): ValidatorFn => {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const entryYearControl = formGroup.get(entryYearValue);
    const completionYearControl = formGroup.get(completionYearValue);

    if (!entryYearControl || !completionYearControl) {
      return null;
    }

    const entryYear = entryYearControl.value;
    const completionYear = completionYearControl.value;

    if (entryYear == null || completionYear == null) {
      return null;
    }

    return entryYear > completionYear
      ? { yearRangeError: "Год начала должен быть меньше года окончания" }
      : null;
  };
};
