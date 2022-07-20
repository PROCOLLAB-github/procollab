/** @format */

import { Injectable } from "@angular/core";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { AuthService } from "../../auth/services";

@Injectable()
export class BearerTokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const headers = new HttpHeaders();
    const token = localStorage.getItem("accessToken");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const req = request.clone({ headers });
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.authService.refreshTokens().pipe(
            switchMap(res => {
              this.authService.memTokens(res);
              const headers = new HttpHeaders();
              const token = localStorage.getItem("accessToken");
              headers.set("Authorization", `Bearer ${token}`);

              return next.handle(
                request.clone({
                  headers,
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
