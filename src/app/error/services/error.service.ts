/** @format */

import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ErrorCode } from "../models/error";

@Injectable({
  providedIn: "root",
})
export class ErrorService {
  constructor(private router: Router) {}

  throwNotFount(): Promise<void> {
    return this.throwError(ErrorCode.NOT_FOUND);
  }

  throwServerError(): Promise<void> {
    return this.throwError(ErrorCode.SERVER_ERROR);
  }

  private throwError(type: ErrorCode): Promise<void> {
    return this.router.navigateByUrl(`/error/${type}`).then(() => console.debug("Route Changed"));
  }
}
