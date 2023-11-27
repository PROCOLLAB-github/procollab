/** @format */

import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ReactiveFormsModule } from "@angular/forms";
import { NgxMaskModule } from "ngx-mask";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { BearerTokenInterceptor } from "@core/interceptors/bearer-token.interceptor";
import { CamelcaseInterceptor } from "@core/interceptors/camelcase.interceptor";
import { GlobalErrorHandlerService } from "@error/services/global-error-handler.service";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    BrowserAnimationsModule,
    MatProgressBarModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CamelcaseInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BearerTokenInterceptor,
      multi: true,
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
