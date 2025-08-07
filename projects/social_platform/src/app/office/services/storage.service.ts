/** @format */

import { Injectable } from "@angular/core";

/**
 * Сервис для работы с локальным хранилищем браузера
 *
 * Предоставляет функциональность для:
 * - Сохранения данных в localStorage или sessionStorage
 * - Получения данных из хранилища с автоматическим парсингом JSON
 * - Работы с объектами и примитивными типами данных
 * - Типизированного получения данных
 */
@Injectable({
  providedIn: "root",
})
export class StorageService {
  /**
   * Сохраняет значение в указанное хранилище
   * Автоматически сериализует объекты в JSON, примитивы сохраняет как есть
   *
   * @param key - ключ для сохранения данных
   * @param value - значение для сохранения (может быть объектом или примитивом)
   * @param storage - тип хранилища (по умолчанию localStorage, может быть sessionStorage)
   */
  setItem(key: string, value: any, storage = localStorage) {
    if (typeof value === "object") storage.setItem(key, JSON.stringify(value));
    else storage.setItem(key, value);
  }

  /**
   * Получает значение из указанного хранилища с типизацией
   * Автоматически парсит JSON и возвращает типизированный результат
   *
   * @template T - тип возвращаемых данных
   * @param key - ключ для получения данных
   * @param storage - тип хранилища (по умолчанию localStorage, может быть sessionStorage)
   * @returns T | null - типизированное значение или null, если ключ не найден
   */
  getItem<T>(key: string, storage = localStorage): T | null {
    const value = storage.getItem(key);
    if (!value) return null;

    const parsedValue = JSON.parse(value);

    return parsedValue as T;
  }
}
