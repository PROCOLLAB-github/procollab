/** @format */

import { Injectable } from "@angular/core";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import {
  catchError,
  defer,
  finalize,
  Observable,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from "rxjs";
import { Router } from "@angular/router";
import { TokenService } from "../services/tokens/token.service";
import { Tokens } from "../models/auth/tokens.model";
import { authLoginUrl, authReturnUrl } from "../models/auth/auth-return-url";

/** Один refresh для параллельных401; отмена страницы не прерывает ротацию токенов. */
@Injectable()
export class BearerTokenInterceptor implements HttpInterceptor {
  private refreshRequest?: Observable<Tokens>;

  constructor(
    private readonly tokenService: TokenService,
    private readonly router: Router,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const path = new URL(request.url, "http://localhost").pathname;
    const tokenEndpoint = /^\/api\/token(?:\/refresh)?\/?$/.test(path);
    const headers: Record<string, string> = {};
    const tokens = this.tokenService.getTokens();
    if (tokens && !tokenEndpoint) headers["Authorization"] = `Bearer ${tokens.access}`;

    const isBlobRequest =
      request.url.includes("/export") ||
      request.url.includes("/download") ||
      request.headers.get("X-Request-Type") === "blob";
    if (!isBlobRequest && !request.headers.has("Accept")) headers["Accept"] = "application/json";

    const req = request.clone({ setHeaders: headers });
    // Вход и refresh сами сообщают об ошибке: повторять их через refresh нельзя.
    if (tokenEndpoint) return next.handle(req);

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401) return throwError(() => error);
        const current = this.tokenService.getTokens();
        if (!current) {
          if (this.returnUrl()) this.endSession();
          return throwError(() => error);
        }
        // Поздний401 старого запроса не должен запускать повторную ротацию.
        if (req.headers.get("Authorization") !== `Bearer ${current.access}`) {
          return this.retryWithAccess(req, next, current.access);
        }
        return this.refresh().pipe(
          switchMap(updated => this.retryWithAccess(req, next, updated.access)),
        );
      }),
    );
  }

  private refresh(): Observable<Tokens> {
    if (!this.refreshRequest) {
      const sessionRefresh = this.tokenService.getTokens()?.refresh;
      this.refreshRequest = defer(() => this.tokenService.refreshTokens()).pipe(
        tap(tokens => {
          // Поздний ответ не восстанавливает вышедший аккаунт и не затирает новый вход.
          if (this.tokenService.getTokens()?.refresh !== sessionRefresh) {
            throw new HttpErrorResponse({ status: 401, error: { code: "session_changed" } });
          }
          this.tokenService.memTokens(tokens);
        }),
        catchError((error: HttpErrorResponse) => {
          if (
            [400, 401, 403].includes(error.status) &&
            this.tokenService.getTokens()?.refresh === sessionRefresh
          )
            this.endSession();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshRequest = undefined;
        }),
        // Refresh с ротацией завершается и сохраняет новую пару даже после ухода со страницы.
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.refreshRequest;
  }

  private retryWithAccess(
    request: HttpRequest<unknown>,
    next: HttpHandler,
    access: string,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request.clone({ setHeaders: { Authorization: `Bearer ${access}` } })).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && this.tokenService.getTokens()?.access === access)
          this.endSession();
        return throwError(() => error);
      }),
    );
  }

  private endSession(): void {
    const url = authLoginUrl(this.returnUrl());
    this.tokenService.clearTokens();
    void this.router.navigateByUrl(url);
  }
  private returnUrl(): string | null {
    const navigation = this.router.currentNavigation?.();
    return (
      authReturnUrl(navigation?.finalUrl?.toString()) ??
      authReturnUrl(navigation?.initialUrl?.toString()) ??
      authReturnUrl(this.router.url)
    );
  }
}
