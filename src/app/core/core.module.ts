/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { BearerTokenInterceptor } from "./interceptors/bearer-token.interceptor";
import { ApiService } from "./services";
import { CamelcaseInterceptor } from "./interceptors/camelcase.interceptor";
import { ControlErrorPipe } from "./pipes/control-error.pipe";

@NgModule({
  declarations: [ControlErrorPipe],
  imports: [CommonModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BearerTokenInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CamelcaseInterceptor,
      multi: true,
    },
    ApiService,
  ],
  exports: [ControlErrorPipe],
})
export class CoreModule {}
