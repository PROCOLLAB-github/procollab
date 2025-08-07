/** @format */

import { ErrorHandler, Injectable, NgZone } from "@angular/core";
import { ErrorService } from "./error.service";

/**
 * Глобальный обработчик ошибок приложения
 *
 * Назначение:
 * - Перехватывает все необработанные ошибки в приложении
 * - Реализует интерфейс ErrorHandler от Angular
 * - Обеспечивает централизованную обработку ошибок
 *
 * Функциональность:
 * - Обрабатывает как синхронные, так и асинхронные ошибки (Promise rejections)
 * - Логирует ошибки в консоль для отладки
 * - Может перенаправлять на страницы ошибок (закомментированный код)
 *
 * Принимает:
 * - err: any - любая ошибка, возникшая в приложении
 *
 * Возвращает: void
 *
 * Зависимости:
 * - ErrorService - для навигации на страницы ошибок
 * - NgZone - для выполнения операций в Angular зоне
 *
 * Примечание:
 * - Код для обработки HTTP ошибок закомментирован
 * - Можно расширить для специфической обработки разных типов ошибок
 */
@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  constructor(private readonly errorService: ErrorService, private readonly zone: NgZone) {}

  /**
   * Обрабатывает глобальные ошибки приложения
   * @param err - ошибка или Promise rejection
   */
  handleError(err: any): void {
    // Извлекаем фактическую ошибку из Promise rejection или используем как есть
    const error = err.rejection ? err.rejection : err;

    // Закомментированный код для обработки HTTP ошибок:
    // if(error instanceof HttpErrorResponse) {
    //   switch(error.status) {
    //     case 404: {
    //       this.zone.run(() => this.errorService.throwNotFount())
    //       break;
    //     }
    //   }
    // }

    // Логируем ошибки типа Error в консоль
    if (error instanceof Error) {
      console.error(error);
    }
  }
}
