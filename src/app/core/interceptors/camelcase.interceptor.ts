/** @format */

import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { map, Observable } from "rxjs";
import * as snakecaseKeys from "snakecase-keys";
import camelcaseKeys from "camelcase-keys";

@Injectable()
export class CamelcaseInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const req = request.clone({
      // @ts-ignore
      body: snakecaseKeys(request.body, { deep: true }),
    });

    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          return event.clone({
            body: camelcaseKeys(event.body, { deep: true }),
          });
        }

        return event;
      })
    );
  }
}
