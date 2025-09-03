/** @format */

interface yearListElement {
  id: number; // порядковый номер в массиве
  value: string; // строка, которую будем показывать в UI
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
 * Пример:  generateYearList(3)  (при текущем 2025‑м году) →
 * [
 *   { id: 0, value: '2023 год', label: '2023 год' },
 *   { id: 1, value: '2024 год', label: '2024 год' },
 *   { id: 2, value: '2025 год', label: '2025 год' }
 * ]
 */
export const generateYearList = (amount: number): yearListElement[] => {
  if (amount <= 0) return [];

  const now = new Date().getFullYear();
  const firstYear = now - amount + 1;
  const list: yearListElement[] = [];

  for (let i = 0; i < amount; i++) {
    const year = firstYear + i;
    list.push({
      id: i,
      value: `${year} год`,
      label: `${year} год`,
    });
  }

  const currentId = amount - 1;
  list.push({
    id: currentId,
    value: `${now} год`,
    label: "по наст. вр.",
  });

  return list;
};
