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
 * Преобразует JSON-тела запросов в snake_case, а JSON-ответы в camelCase.
 */
@Injectable()
export class CamelcaseInterceptor implements HttpInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(
    request: HttpRequest<Record<string, any>>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let req: HttpRequest<Record<string, any>>;

    // FormData содержит бинарные данные и собственные ключи полей.
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
