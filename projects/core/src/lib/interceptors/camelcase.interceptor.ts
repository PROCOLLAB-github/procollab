/** @format */

import { Injectable } from "@angular/core";
import {
  type HttpEvent,
  type HttpHandler,
  type HttpInterceptor,
  type HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { map, type Observable } from "rxjs";
import * as snakecaseKeys from "snakecase-keys";
import camelcaseKeys from "camelcase-keys";
import { LoggerService } from "../services/logger/logger.service";

/**
 * HTTP-интерцептор для преобразования стиля именования ключей
 * между frontend и backend слоями.
 *
 * Преобразования:
 * - исходящие запросы: camelCase → snake_case;
 * - входящие ответы: snake_case → camelCase.
 *
 * Преобразование выполняется рекурсивно
 * для вложенных объектов и массивов.
 */
@Injectable()
export class CamelcaseInterceptor implements HttpInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  /**
   * Преобразует тело запроса перед отправкой
   * и тело ответа после получения.
   */
  intercept(
    request: HttpRequest<Record<string, any>>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let req: HttpRequest<Record<string, any>>;

    /**
     * FormData исключается из преобразования,
     * так как содержит бинарные данные и собственную структуру ключей.
     */
    if (request.body && !(request.body instanceof FormData)) {
      req = request.clone({
        body: snakecaseKeys(request.body, {
          deep: true,
        }),
      });
    } else {
      req = request.clone();
    }

    // Blob-ответы пропускаются без преобразования.
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          if (event.body instanceof Blob) {
            return event;
          }

          // Преобразование применяется только к объектным структурам.
          if (typeof event.body !== "object" || event.body === null) {
            return event;
          }

          try {
            return event.clone({
              body: camelcaseKeys(event.body, {
                deep: true,
              }),
            });
          } catch (error) {
            this.loggerService.warn(
              "CamelcaseInterceptor: Failed to transform response body",
              error
            );
            return event;
          }
        }

        return event;
      })
    );
  }
}
