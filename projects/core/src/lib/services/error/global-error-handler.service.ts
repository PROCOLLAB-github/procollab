/** @format */

import { ErrorHandler, inject, Injectable, NgZone } from "@angular/core";
import { ErrorService } from "./error.service";
import { LoggerService } from "../logger/logger.service";

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
  private readonly logger = inject(LoggerService);

  constructor(private readonly errorService: ErrorService, private readonly zone: NgZone) {}

  handleError(err: any): void {
    const error = err.rejection ? err.rejection : err;

    if (error instanceof Error) {
      this.logger.error(`[GlobalError] ${error.name}: ${error.message}`, error.stack);
    } else {
      this.logger.error("[GlobalError] Unknown error", error);
    }
  }
}
