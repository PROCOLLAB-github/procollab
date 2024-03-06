/** @format */

import { ErrorHandler, importProvidersFrom, ApplicationConfig } from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { provideAnimations } from "@angular/platform-browser/animations";
import { NgxMaskModule } from "ngx-mask";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { GlobalErrorHandlerService } from "@error/services/global-error-handler.service";
import { BearerTokenInterceptor } from "@core/interceptors/bearer-token.interceptor";
import { CamelcaseInterceptor } from "@core/interceptors/camelcase.interceptor";
import { HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { APP_ROUTES } from "./app.routes";

export const APP_CONFIG: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      ReactiveFormsModule,
      NgxMaskModule.forRoot(),
      MatProgressBarModule
    ),
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
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(APP_ROUTES),
    provideAnimations(),
  ],
};
