/** @format */

import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, ErrorHandler, NgZone } from '@angular/core';
import { ErrorService } from './error.service';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  constructor(
    private readonly errorService: ErrorService,
    private readonly zone: NgZone
  ) {}

  handleError(err: any): void {
    const error = err.rejection ? err.rejection : err;
    if(error instanceof HttpErrorResponse) {
      switch(error.status) {
        case 404: {
          this.zone.run(() => this.errorService.throwNotFount())
          break;
        }
      }
    }
    if(error instanceof Error) {
      console.error(error)
    }
  }
}
