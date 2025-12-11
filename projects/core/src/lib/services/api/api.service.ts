/** @format */

import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { first, Observable } from "rxjs";
import { API_URL } from "../../providers";

/**
 * Базовый сервис для работы с REST API
 *
 * Предназначение:
 * - Предоставляет унифицированный интерфейс для HTTP запросов
 * - Автоматически добавляет базовый URL к всем запросам
 * - Использует оператор first() для автоматического завершения Observable
 * - Поддерживает типизацию TypeScript для запросов и ответов
 *
 * Особенности:
 * - Все методы возвращают Observable, который автоматически завершается после первого значения
 * - Базовый URL инжектируется через DI токен API_URL
 * - Поддерживает передачу HTTP параметров и дополнительных опций
 *
 * Используется как базовый класс для специализированных API сервисов
 */
@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_URL) private readonly apiUrl: string
  ) {}

  /**
   * Выполняет GET запрос к API
   * @param path - Относительный путь к ресурсу (будет добавлен к базовому URL)
   * @param params - HTTP параметры запроса (query string)
   * @param options - Дополнительные опции HttpClient (headers, responseType и т.д.)
   * @returns Observable с типизированным ответом, завершающийся после первого значения
   *
   * Пример использования:
   * apiService.get<User[]>('/users', new HttpParams().set('page', '1'))
   */
  get<T>(path: string, params?: HttpParams, options?: object): Observable<T> {
    return this.http.get(this.apiUrl + path, { params, ...options }).pipe(first()) as Observable<T>;
  }

  /**
   * Выполняет PUT запрос к API (полное обновление ресурса)
   * @param path - Относительный путь к ресурсу
   * @param body - Тело запроса (объект для обновления)
   * @returns Observable с типизированным ответом
   *
   * Пример использования:
   * apiService.put<User>('/users/1', { name: 'John', email: 'john@example.com' })
   */
  put<T>(path: string, body: object): Observable<T> {
    return this.http.put<T>(this.apiUrl + path, body).pipe(first()) as Observable<T>;
  }

  /**
   * Выполняет PATCH запрос к API (частичное обновление ресурса)
   * @param path - Относительный путь к ресурсу
   * @param body - Тело запроса (объект с полями для обновления)
   * @returns Observable с типизированным ответом
   *
   * Пример использования:
   * apiService.patch<User>('/users/1', { name: 'John' }) // обновляет только имя
   */
  patch<T>(path: string, body: object): Observable<T> {
    return this.http.patch(this.apiUrl + path, body).pipe(first()) as Observable<T>;
  }

  /**
   * Выполняет POST запрос к API (создание нового ресурса)
   * @param path - Относительный путь к ресурсу
   * @param body - Тело запроса (данные для создания)
   * @returns Observable с типизированным ответом (обычно созданный объект)
   *
   * Пример использования:
   * apiService.post<User>('/users', { name: 'John', email: 'john@example.com' })
   */
  post<T>(path: string, body: object): Observable<T> {
    return this.http.post<T>(this.apiUrl + path, body).pipe(first()) as Observable<T>;
  }

  /**
   * Выполняет DELETE запрос к API (удаление ресурса)
   * @param path - Относительный путь к ресурсу
   * @param params - HTTP параметры запроса (опционально)
   * @returns Observable с типизированным ответом
   *
   * Пример использования:
   * apiService.delete<void>('/users/1')
   * apiService.delete<DeleteResponse>('/users', new HttpParams().set('ids', '1,2,3'))
   */
  delete<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http.delete<T>(this.apiUrl + path, { params }).pipe(first()) as Observable<T>;
  }
}
