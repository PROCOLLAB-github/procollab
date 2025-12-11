/** @format */

import { Injectable } from "@angular/core";
import { distinctUntilChanged, Subject } from "rxjs";
import { Snack } from "@ui/models/snack.model";
import { nanoid } from "nanoid";

/**
 * Сервис для управления всплывающими уведомлениями (snackbar).
 * Предоставляет методы для отображения различных типов уведомлений.
 *
 * Методы:
 * - success: показывает успешное уведомление (зеленое)
 * - error: показывает уведомление об ошибке (красное)
 * - info: показывает информационное уведомление (синее)
 *
 * Все методы принимают:
 * - text: текст уведомления
 * - options: настройки (timeout - время отображения в мс, по умолчанию 5000)
 */
@Injectable({
  providedIn: "root",
})
export class SnackbarService {
  constructor() {}

  /** Subject для управления потоком уведомлений */
  private readonly snacks$ = new Subject<Snack>();

  /** Observable поток уведомлений для подписки компонентами */
  snacks = this.snacks$.asObservable().pipe(distinctUntilChanged());

  /**
   * Показывает успешное уведомление
   * @param text - текст уведомления
   * @param options - настройки отображения
   */
  success(text: string, options: { timeout: number } = { timeout: 5000 }): void {
    this.snacks$.next({ id: nanoid(), text, timeout: options.timeout, type: "success" });
  }

  /**
   * Показывает уведомление об ошибке
   * @param text - текст уведомления
   * @param options - настройки отображения
   */
  error(text: string, options: { timeout: number } = { timeout: 5000 }): void {
    this.snacks$.next({ id: nanoid(), text, timeout: options.timeout, type: "error" });
  }

  /**
   * Показывает информационное уведомление
   * @param text - текст уведомления
   * @param options - настройки отображения
   */
  info(text: string, options: { timeout: number } = { timeout: 5000 }): void {
    this.snacks$.next({ id: nanoid(), text, timeout: options.timeout, type: "info" });
  }
}
