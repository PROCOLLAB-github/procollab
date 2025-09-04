/** @format */

interface trlListElement {
  id: number; // порядковый номер в массиве
  value: number; // строка, которую будем показывать в UI
  label: string; // то же самое, что и value (можно использовать обе подписи)
}

/**
 * Генерирует массив годов.
 *
 * @param amount – сколько лет нужно вывести.
 *                Считаем, что список должен начинаться с «текущий‑year‑amount+1» и
 *                заканчиваться текущим календарным годом.
 * @returns массив объектов вида { id, value, label }
 *
 * Пример:  generateTrlList(3)
 * [
 *   { id: 0, value: 1, label: '1' },
 *   { id: 1, value: 2, label: '2' },
 *   { id: 2, value: 3, label: '3' }
 * ]
 */
export const generateTrlList = (amount: number): trlListElement[] => {
  if (amount <= 0) return [];

  const list: trlListElement[] = [];

  for (let i = 1; i < amount; i++) {
    list.push({
      id: i,
      value: i,
      label: `${i}`,
    });
  }

  return list;
};
