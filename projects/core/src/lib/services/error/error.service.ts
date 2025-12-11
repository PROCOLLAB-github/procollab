/** @format */

import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ErrorCode } from "../../models/error/error-code";

/**
 * Сервис для обработки и навигации к страницам ошибок
 *
 * Назначение:
 * - Централизованная обработка ошибок в приложении
 * - Программная навигация на соответствующие страницы ошибок
 * - Логирование переходов для отладки
 *
 * Методы:
 * - throwNotFount(): навигация на страницу 404
 * - throwServerError(): навигация на страницу 500
 * - throwError(type): приватный метод для навигации на любую страницу ошибки
 *
 * Принимает:
 * - ErrorCode - тип ошибки для навигации
 *
 * Возвращает:
 * - Promise<void> - промис завершения навигации
 *
 * Зависимости:
 * - Router - для программной навигации между страницами
 */
@Injectable({
  providedIn: "root",
})
export class ErrorService {
  constructor(private readonly router: Router) {}

  /**
   * Навигация на страницу ошибки 404
   * @returns Promise<void> - промис завершения навигации
   */
  throwNotFount(): Promise<void> {
    return this.throwError(ErrorCode.NOT_FOUND);
  }

  /**
   * Навигация на страницу ошибки 500
   * @returns Promise<void> - промис завершения навигации
   */
  throwServerError(): Promise<void> {
    return this.throwError(ErrorCode.SERVER_ERROR);
  }

  /**
   * Приватный метод для навигации на страницу ошибки
   * @param type - код ошибки из ErrorCode enum
   * @returns Promise<void> - промис завершения навигации с логированием
   */
  private throwError(type: ErrorCode): Promise<void> {
    return this.router.navigateByUrl(`/error/${type}`).then(() => console.debug("Route Changed"));
  }
}
