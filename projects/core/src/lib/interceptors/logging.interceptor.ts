/** @format */

import { Injectable } from "@angular/core";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { LoggerService } from "../services";

/**
 * HTTP-интерцептор для логирования результатов HTTP-запросов.
 *
 * Логирует:
 * - HTTP-метод;
 * - URL запроса;
 * - статус ответа;
 * - длительность выполнения запроса.
 *
 * Ошибки запросов дополнительно записываются
 * через `LoggerService.error`.
 */
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Измеряет время выполнения запроса
   * и логирует результат после завершения.
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const started = Date.now();

    return next.handle(request).pipe(
      tap({
        next: event => {
          if (event instanceof HttpResponse) {
            const elapsed = Date.now() - started;
            this.logger.debug(
              `[HTTP] ${request.method} ${request.urlWithParams} ${event.status} ${elapsed}ms`
            );
          }
        },
        error: (error: HttpErrorResponse) => {
          const elapsed = Date.now() - started;
          this.logger.error(
            `[HTTP] ${request.method} ${request.urlWithParams} ${error.status} ${elapsed}ms`,
            error.message
          );
        },
      })
    );
  }
}
