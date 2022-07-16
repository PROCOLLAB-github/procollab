/** @format */

import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
} from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class BearerTokenInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const headers = new HttpHeaders();
    const token = localStorage.getItem("access-token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const req = request.clone({ headers });
    return next.handle(req);
  }
}
