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
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
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

        return throwError(() => error);
      })
    );
  }
}
