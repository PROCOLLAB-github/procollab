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

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(private readonly logger: LoggerService) {}

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
