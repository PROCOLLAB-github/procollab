/** @format */

export interface optionsListElement {
  id: number; // порядковый номер в массиве
  value: number | string; // строка, которую будем показывать в UI
  label: string; // то же самое, что и value (можно использовать обе подписи)
}

/**
 * Генерирует массив опций.
 *
 * @param amount – сколько элементов нужно вывести.
 * @returns массив объектов вида { id, value, label }
 *
 * Пример:  generatOptionslList(3, 'numbers');
 * [
 *   { id: 0, value: 1, label: '1' },
 *   { id: 1, value: 2, label: '2' },
 *   { id: 2, value: 3, label: '3' }
 * ]
 */
export const generateOptionsList = (
  amount: number,
  type: "numbers" | "years" | "strings",
  otherStrings: string[] = []
): optionsListElement[] => {
  if (amount <= 0) return [];

  const now = new Date().getFullYear();
  const list: optionsListElement[] = [];
  const firstYear = now - amount + 1;

  for (let i = 0; i < amount; i++) {
    let value: string;
    let label: string;

    if (type === "numbers") {
      value = `${i + 1}`;
      label = `${i + 1}`;
    } else if (type === "years") {
      const year = firstYear + i;
      value = `${year} год`;
      label = `${year} год`;
    } else if (type === "strings") {
      const stringValue = otherStrings[i] || `${i}`;
      value = stringValue;
      label = stringValue;
    } else {
      value = `${i}`;
      label = `${i}`;
    }

    list.push({
      id: i,
      value,
      label,
    });
  }

  if (type === "years") {
    const currentId = amount - 1;
    list.push({
      id: currentId,
      value: `${now} год`,
      label: "по наст. вр.",
    });
  }

  return list;
};
