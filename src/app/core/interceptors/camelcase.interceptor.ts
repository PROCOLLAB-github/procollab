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

  intercept(
    request: HttpRequest<Record<string, any>>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let req: HttpRequest<Record<string, any>>;
    if (request.body) {
      req = request.clone({
        body: snakecaseKeys(request.body, { deep: true }),
      });
    } else {
      req = request.clone();
    }

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
