/** @format */

import { Injectable } from "@angular/core";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from "rxjs";
import { Router } from "@angular/router";
import { LoggerService, TokenService } from "../services";

/**
 * HTTP-интерцептор для автоматического добавления Bearer-токена
 * и повторной отправки запросов после обновления access-токена.
 *
 * Основные сценарии:
 * - добавляет `Authorization` header при наличии токенов;
 * - предотвращает параллельные refresh-запросы;
 * - повторяет запросы после успешного обновления токена;
 * - перенаправляет пользователя на страницу авторизации
 *   при недействительном refresh-токене.
 */
@Injectable()
export class BearerTokenInterceptor implements HttpInterceptor {
  constructor(
    private readonly tokenService: TokenService,
    private readonly router: Router,
    private readonly loggerService: LoggerService,
  ) {}

  /**
   * Флаг активного процесса обновления токена.
   *
   * Используется для предотвращения одновременных refresh-запросов
   * при множественных ответах `401 Unauthorized`.
   */
  private isRefreshing = false;

  /**
   * Хранилище access-токена для запросов,
   * ожидающих завершения refresh-процесса.
   */
  private refreshTokenSubject = new BehaviorSubject<any>(null);

  /**
   * Добавляет служебные заголовки к HTTP-запросу
   * и подключает обработку ошибок авторизации.
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const headers: Record<string, string> = {};

    const tokens = this.tokenService.getTokens();

    if (tokens !== null) {
      headers["Authorization"] = `Bearer ${tokens.access}`;
    }

    /**
     * Blob-запросы исключаются из установки `Accept: application/json`,
     * чтобы браузер не пытался интерпретировать бинарный ответ как JSON.
     */
    const isBlobRequest =
      request.url.includes("/export") ||
      request.url.includes("/download") ||
      (request.headers.has("X-Request-Type") && request.headers.get("X-Request-Type") === "blob");

    const hasAcceptHeader = request.headers.has("Accept");

    if (!isBlobRequest && !hasAcceptHeader) {
      headers["Accept"] = "application/json";
    }

    const req = request.clone({ setHeaders: headers });

    if (tokens !== null) {
      return this.handleRequestWithTokens(req, next);
    } else {
      return next.handle(req);
    }
  }

  /**
   * Обрабатывает запросы с авторизацией
   * и перехватывает ошибки аутентификации.
   */
  private handleRequestWithTokens(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        /**
         * Ошибка обновления токена означает,
         * что пользовательская сессия больше недействительна.
         */
        if (error.status === 401 && request.url.includes("/api/token/refresh")) {
          this.router
            .navigateByUrl("/auth/login")
            .then(() => this.loggerService.debug("Redirected to login: refresh token expired"));
        }
        // Для остальных 401 выполняется попытка обновления access-токена.
        else if (error.status === 401 && !request.url.includes("/api/token/refresh")) {
          return this.handle401(request, next);
        }

        return throwError(() => error);
      }),
    );
  }

  /**
   * Выполняет обновление токена и повторяет исходный запрос.
   *
   * Во время активного refresh-процесса остальные запросы
   * ожидают новый access-токен через `refreshTokenSubject`.
   */
  private handle401(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.tokenService.refreshTokens().pipe(
        catchError(err => {
          this.isRefreshing = false;
          return throwError(err);
        }),
        switchMap(res => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(res.access);

          this.tokenService.memTokens(res);

          const headers: Record<string, string> = {};

          const tokens = this.tokenService.getTokens();
          if (tokens) {
            headers["Authorization"] = `Bearer ${tokens.access}`;
          }

          const isBlobRequest =
            request.url.includes("/export") ||
            request.url.includes("/download") ||
            (request.headers.has("X-Request-Type") &&
              request.headers.get("X-Request-Type") === "blob");

          const hasAcceptHeader = request.headers.has("Accept");

          if (!isBlobRequest && !hasAcceptHeader) {
            headers["Accept"] = "application/json";
          }

          return next.handle(
            request.clone({
              setHeaders: headers,
            }),
          );
        }),
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
        };

        const isBlobRequest =
          request.url.includes("/export") ||
          request.url.includes("/download") ||
          (request.headers.has("X-Request-Type") &&
            request.headers.get("X-Request-Type") === "blob");

        const hasAcceptHeader = request.headers.has("Accept");

        if (!isBlobRequest && !hasAcceptHeader) {
          headers["Accept"] = "application/json";
        }

        return next.handle(
          request.clone({
            setHeaders: headers,
          }),
        );
      }),
    );
  }
}
