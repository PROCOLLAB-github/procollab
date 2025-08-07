/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from "rxjs";
import { Industry } from "@models/industry.model";
import { plainToInstance } from "class-transformer";

/**
 * Сервис для работы с отраслями (индустриями)
 *
 * Предоставляет функциональность для:
 * - Получения списка всех доступных отраслей
 * - Кеширования отраслей в памяти для быстрого доступа
 * - Поиска конкретной отрасли по идентификатору
 * - Обработки ошибок при загрузке данных
 */
@Injectable({
  providedIn: "root",
})
export class IndustryService {
  private readonly INDUSTRIES_URL = "/industries";

  constructor(private readonly apiService: ApiService) {}

  /**
   * BehaviorSubject для хранения списка отраслей в памяти
   * Обеспечивает кеширование и реактивное обновление данных
   */
  private industries$ = new BehaviorSubject<Industry[]>([]);

  /**
   * Observable для подписки на изменения списка отраслей
   * @returns Observable<Industry[]> - поток данных с отраслями
   */
  industries = this.industries$.asObservable();

  /**
   * Получает список всех доступных отраслей с сервера
   * Преобразует данные в типизированные объекты и кеширует их
   * Обрабатывает ошибки и обновляет локальный кеш при успешной загрузке
   *
   * @returns Observable<Industry[]> - массив отраслей с названиями и идентификаторами
   */
  getAll(): Observable<Industry[]> {
    return this.apiService.get<Industry[]>(`${this.INDUSTRIES_URL}/`).pipe(
      catchError(err => throwError(err)),
      map(industries => plainToInstance(Industry, industries)),
      tap(industries => {
        this.industries$.next(industries);
      })
    );
  }

  /**
   * Находит конкретную отрасль в переданном массиве по идентификатору
   * Вспомогательный метод для поиска отрасли без дополнительных запросов к серверу
   *
   * @param industries - массив отраслей для поиска
   * @param industryId - идентификатор искомой отрасли
   * @returns Industry | undefined - найденная отрасль или undefined, если не найдена
   */
  getIndustry(industries: Industry[], industryId: number): Industry | undefined {
    return industries.find(industry => industry.id === industryId);
  }
}
