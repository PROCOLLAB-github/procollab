/** @format */

import { Pipe, type PipeTransform } from "@angular/core";
import * as dayjs from "dayjs";
import * as relativeTime from "dayjs/plugin/relativeTime";
import * as isToday from "dayjs/plugin/isToday";
import "dayjs/locale/ru";

// Подключаем необходимые плагины dayjs
dayjs.extend(relativeTime);
dayjs.extend(isToday);

/**
 * Пайп для работы с датами используя библиотеку dayjs
 *
 * Возможности:
 * - Форматирование дат в различных форматах
 * - Вычисление относительного времени ("2 часа назад", "через 3 дня")
 * - Вычисление разности между датами
 * - Проверка специальных условий (сегодняшняя дата)
 * - Поддержка русской локализации
 *
 * Преимущества перед стандартным DatePipe:
 * - Более гибкое API для работы с относительным временем
 * - Лучшая поддержка локализации
 * - Дополнительные утилиты для работы с датами
 */
@Pipe({
  name: "dayjs",
  standalone: true,
})
export class DayjsPipe implements PipeTransform {
  constructor() {
    // Устанавливаем русскую локаль для всех операций
    dayjs.locale("ru");
  }

  /**
   * Трансформирует дату в зависимости от типа операции
   * @param value - Значение даты (строка, Date, dayjs объект)
   * @param type - Тип операции для выполнения
   * @param options - Дополнительные параметры (например, формат для format)
   * @returns Результат операции (строка, число или boolean)
   *
   * Поддерживаемые типы операций:
   *
   * 1. "toX" - время ДО указанной даты (без "назад"/"через")
   *    Пример: "2 часа", "3 дня"
   *
   * 2. "fromX" - время С указанной даты (без "назад"/"через")
   *    Пример: "2 часа", "3 дня"
   *
   * 3. "diffDay" - разность в днях между датой и текущим моментом
   *    Возвращает число (положительное если дата в будущем)
   *
   * 4. "diffHour" - разность в часах между датой и текущим моментом
   *    Возвращает число (положительное если дата в будущем)
   *
   * 5. "isToday" - проверка, является ли дата сегодняшней
   *    Возвращает boolean
   *
   * 6. "format" - форматирование даты по указанному шаблону
   *    Требует параметр options с форматом
   *
   * Примеры использования в шаблонах:
   *
   * <!-- Относительное время -->
   * <span>Создано {{ post.createdAt | dayjs:'fromX' }} назад</span>
   * <!-- Результат: "Создано 2 часа назад" -->
   *
   * <!-- Форматирование -->
   * <span>{{ user.birthday | dayjs:'format':'DD.MM.YYYY' }}</span>
   * <!-- Результат: "15.03.1990" -->
   *
   * <!-- Условное отображение -->
   * <span *ngIf="message.date | dayjs:'isToday'">Сегодня</span>
   *
   * <!-- Вычисление разности -->
   * <span>Осталось {{ deadline | dayjs:'diffDay' }} дней</span>
   */
  transform(value: any, type: string, options?: any): string | number | boolean {
    switch (type) {
      case "toX":
        // Время до указанной даты (например, "через 2 часа")
        // true в конце убирает префикс "через"/"назад"
        return dayjs().to(dayjs(value), true);

      case "diffDay":
        // Разница в днях между датой и текущим моментом
        // Положительное число = дата в будущем
        // Отрицательное число = дата в прошлом
        return dayjs(value).diff(dayjs(), "day");

      case "diffHour":
        // Разница в часах между датой и текущим моментом
        return dayjs(value).diff(dayjs(), "hour");

      case "isToday":
        // Проверка, является ли дата сегодняшней
        // Сравнивает только дату, игнорируя время
        return dayjs(value).isToday();

      case "fromX":
        // Время с указанной даты (например, "2 часа назад")
        // true в конце убирает префикс "назад"
        return dayjs(value).from(dayjs(), true);

      case "format":
        // Форматирование даты согласно переданному формату
        // options должен содержать строку формата
        // Примеры форматов: 'DD.MM.YYYY', 'HH:mm', 'DD MMMM YYYY'
        return dayjs(value).format(options);

      default:
        // Неизвестный тип операции
        throw new Error(`Invalid action type specified: ${type}`);
    }
  }
}
