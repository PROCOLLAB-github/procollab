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
import { AuthService } from "@auth/services";

@Injectable()
export class BearerTokenInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthService) {}

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<any>(null);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    const tokens = this.authService.getTokens();

    if (tokens !== null) {
      // eslint-disable-next-line
      headers["Authorization"] = `Bearer ${tokens.access}`;
    }

    const req = request.clone({ setHeaders: headers });

    if (tokens !== null) {
      return this.handleRequestWithTokens(req, next);
    } else {
      return next.handle(request);
    }
  }

  private handleRequestWithTokens(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  private handle401(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshTokens().pipe(
        switchMap(res => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(res.access);

          this.authService.memTokens(res);
          const headers: Record<string, string> = {
            Accept: "application/json",
          };

          const tokens = this.authService.getTokens();

          if (tokens) {
            headers["Authorization"] = `Bearer ${tokens.access}`;
          }

          return next.handle(
            request.clone({
              setHeaders: headers,
            })
          );
        }),
        catchError(err => {
          this.isRefreshing = false;

          this.authService.clearTokens();
          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(t => t !== null),
      take(1),
      switchMap(t => next.handle(request.clone({ setHeaders: { Authorization: `Bearer ${t}` } })))
    );
  }
}
