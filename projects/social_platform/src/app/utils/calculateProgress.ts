/** @format */

import { User } from "@auth/models/user.model";
import { profileFields } from "projects/core/src/consts/other/profile-fields.const";

/**
 * @fileoverview Функция для расчета прогресса заполнения профиля пользователя
 *
 * Этот модуль экспортирует функцию, которая вычисляет процент заполнения
 * профиля пользователя на основе заполненных полей.
 *
 * @param {User} user - Объект пользователя, содержащий данные профиля
 * @returns {number} - Процент заполнения профиля (от 0 до 100)
 *
 * Принцип работы:
 * 1. Проходит по всем полям профиля из константы profileFields
 * 2. Проверяет заполнено ли каждое поле:
 *    - Для массивов: проверяет наличие хотя бы одного элемента
 *    - Для строк: проверяет, что строка не пустая
 * 3. Вычисляет процент заполненных полей от общего количества полей
 * 4. Возвращает округленное значение процента
 */
export const calculateProfileProgress = (user: User) => {
  let filledCount = 0;

  profileFields.forEach(({ key, type }) => {
    const value = user[key as keyof User];

    if (type === "array") {
      if (Array.isArray(value) && value.length > 0) filledCount++;
    } else {
      if (typeof value === "string" && value.trim() !== "") filledCount++;
    }
  });

  return Math.round((filledCount / profileFields.length) * 100);
};
