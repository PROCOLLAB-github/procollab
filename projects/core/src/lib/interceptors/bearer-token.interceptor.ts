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
import { TokenService } from "../services";

/**
 * HTTP интерцептор для автоматического управления JWT токенами
 *
 * Основные функции:
 * 1. Автоматически добавляет Bearer токен к исходящим HTTP запросам
 * 2. Перехватывает 401 ошибки и автоматически обновляет токены
 * 3. Повторяет неудачные запросы с новым токеном
 * 4. Предотвращает множественные одновременные запросы на обновление токена
 * 5. Перенаправляет на страницу логина при невозможности обновить токен
 *
 * Алгоритм работы:
 * - Если есть токены → добавляет Authorization header
 * - При 401 ошибке → пытается обновить токен
 * - При успешном обновлении → повторяет исходный запрос
 * - При неудаче обновления → перенаправляет на /auth/login
 */
@Injectable()
export class BearerTokenInterceptor implements HttpInterceptor {
  constructor(private readonly tokenService: TokenService, private readonly router: Router) {}

  /** Флаг предотвращения множественных запросов на обновление токена */
  private isRefreshing = false;

  /** Subject для уведомления ожидающих запросов о получении нового токена */
  private refreshTokenSubject = new BehaviorSubject<any>(null);

  /**
   * Основной метод интерцептора
   * @param request - Исходящий HTTP запрос
   * @param next - Следующий обработчик в цепочке
   * @returns Observable с HTTP событием
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Базовые заголовки для всех запросов
    const headers: Record<string, string> = {};

    const tokens = this.tokenService.getTokens();

    // Добавляем Authorization header если токены доступны
    if (tokens !== null) {
      headers["Authorization"] = `Bearer ${tokens.access}`;
    }

    // Для blob запросов (файлы) не устанавливаем Accept, чтобы не парсить blob как JSON
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
   * Обрабатывает запросы с токенами и перехватывает ошибки аутентификации
   * @param request - HTTP запрос с токеном
   * @param next - Следующий обработчик
   * @returns Observable с результатом запроса или обработкой ошибки
   */
  private handleRequestWithTokens(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Если 401 ошибка на refresh endpoint - токен refresh недействителен
        if (error.status === 401 && request.url.includes("/api/token/refresh")) {
          this.router
            .navigateByUrl("/auth/login")
            .then(() => console.debug("Redirected to login: refresh token expired"));
        }
        // Если 401 на другом endpoint - пытаемся обновить токен
        else if (error.status === 401 && !request.url.includes("/api/token/refresh")) {
          return this.handle401(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Обрабатывает 401 ошибку - обновляет токен и повторяет запрос
   * Использует механизм блокировки для предотвращения множественных запросов обновления
   * @param request - Исходный запрос, который вернул 401
   * @param next - Следующий обработчик
   * @returns Observable с повторным запросом или ошибкой
   */
  private handle401(
    request: HttpRequest<unknown>,
    next: HttpHandler
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
            })
          );
        })
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
          })
        );
      })
    );
  }
}
