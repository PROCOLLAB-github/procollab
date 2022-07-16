/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { BearerTokenInterceptor } from "./interceptors/bearer-token.interceptor";

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BearerTokenInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {}
