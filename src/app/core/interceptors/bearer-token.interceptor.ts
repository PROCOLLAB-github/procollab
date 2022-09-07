/** @format */

import { Injectable } from "@angular/core";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { AuthService } from "../../auth/services";

@Injectable()
export class BearerTokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  private retry = 0;
  private retryCount = 3;

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    const tokens = this.authService.getTokens();

    if (tokens !== null) {
      // eslint-disable-next-line
      headers["Authorization"] = `Bearer ${tokens.accessToken}`;
    }

    const req = request.clone({ setHeaders: headers });
    if (tokens !== null && this.retry < this.retryCount) {
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.retry++;
            return this.handle401(request, next);
          }

          return throwError(() => error);
        })
      );
    } else {
      return next.handle(request);
    }
  }

  private handle401(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return this.authService.refreshTokens().pipe(
      switchMap(res => {
        this.authService.memTokens(res);
        const headers: Record<string, string> = {
          Accept: "application/json",
        };

        const tokens = this.authService.getTokens();

        if (tokens) {
          // eslint-disable-next-line
          headers["Authorization"] = `Bearer ${tokens.accessToken}`;
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
