/** @format */

import { Injectable } from "@angular/core";
import { distinctUntilChanged, ReplaySubject } from "rxjs";

/**
 * Сервис для управления навигацией и заголовками страниц
 *
 * Предоставляет функциональность для:
 * - Установки и получения заголовка текущей страницы
 * - Реактивного обновления заголовков в компонентах
 * - Предотвращения дублирующих обновлений заголовков
 */
@Injectable({
  providedIn: "root",
})
export class NavService {
  constructor() {}

  /**
   * ReplaySubject для хранения текущего заголовка навигации
   * ReplaySubject(1) означает, что новые подписчики сразу получат последнее значение
   */
  navTitle$ = new ReplaySubject<string>(1);

  /**
   * Observable для подписки на изменения заголовка навигации
   * distinctUntilChanged() предотвращает эмиссию одинаковых значений подряд
   * @returns Observable<string> - поток изменений заголовка страницы
   */
  navTitle = this.navTitle$.asObservable().pipe(distinctUntilChanged());

  /**
   * Устанавливает новый заголовок для текущей страницы
   * Уведомляет всех подписчиков об изменении заголовка
   *
   * @param title - новый заголовок страницы для отображения в навигации
   */
  setNavTitle(title: string): void {
    this.navTitle$.next(title);
  }
}
