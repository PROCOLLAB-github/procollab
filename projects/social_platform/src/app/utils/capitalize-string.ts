/**
 * Эта функция преобразует строку так, что первая буква каждого слова становится
 * заглавной, а остальные - строчными.
 *
 *
 * Принцип работы:
 * 1. Разбивает строку на слова по пробелам
 * 2. Если строка состоит из одного слова, делает первую букву заглавной, а остальные - строчными
 * 3. Если строка состоит из нескольких слов, для каждого слова делает первую букву заглавной,
 *    а остальные - строчными, затем соединяет слова обратно с пробелами
 *
 * Пример использования:
 * capitalizeString("иван иванов") // "Иван Иванов"
 * capitalizeString("МОСКВА") // "Москва"
 *
 * @format
 * @fileoverview Функция для преобразования строки к формату с заглавной буквы
 * @param {string} string - Исходная строка для преобразования
 * @returns {string} - Преобразованная строка с заглавными первыми буквами каждого слова
 */

export function capitalizeString(string: string): string {
  const stringArray = string.split(" ");
  if (stringArray.length === 1) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
  return stringArray
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
