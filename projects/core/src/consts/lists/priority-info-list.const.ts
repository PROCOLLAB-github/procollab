/**
 * Информация для приоритетов
 *
 * @format
 * @field name - выбор в выпадающем списке
 * @field color - цвет для определенного типа приоритета
 * @field priorityType - значение (от 0 до 5), которое соотносится на бэке
 */

export const priorityInfoList = [
  {
    id: 0,
    label: "бэклог",
    color: "#322299",
    priorityType: 0,
  },
  {
    id: 1,
    label: "в ближайшие часы",
    color: "#A63838",
    priorityType: 1,
  },
  {
    id: 2,
    label: "высокий",
    color: "#D48A9E",
    priorityType: 2,
  },
  {
    id: 3,
    label: "средний",
    color: "#E5B25D",
    priorityType: 3,
  },
  {
    id: 4,
    label: "низкий",
    color: "#297373",
    priorityType: 4,
  },
  {
    id: 5,
    label: "улучшение",
    color: "#88C9A1",
    priorityType: 5,
  },
];
