/**
 * Эта функция создает новый объект, исключая из исходного объекта все свойства,
 * значения которых равны null, undefined или пустой строке.
 *
 *
 * Принцип работы:
 * 1. Преобразует объект в массив пар [ключ, значение]
 * 2. Фильтрует пары, оставляя только те, где значение не null, не undefined и не пустая строка
 * 3. Преобразует отфильтрованный массив обратно в объект
 *
 * Пример использования:
 * const user = { name: "Иван", email: "", age: null, city: "Москва" };
 * const cleanUser = stripNullish(user); // { name: "Иван", city: "Москва" }
 *
 * @format
 * @fileoverview Функция для удаления пустых и null значений из объекта
 * @param {T} obj - Исходный объект, из которого нужно удалить пустые значения
 * @returns {Partial<T>} - Новый объект без пустых значений
 */

export const stripNullish = <T extends object>(obj: T): Partial<T> =>
  (Object.entries(obj) as [keyof T, any][])
    .filter(([_, v]) => {
      if (v == null) return false;
      if (typeof v === "string" && v.trim() === "") return false;
      return true;
    })
    .reduce((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {} as Partial<T>);
