/** @format */

import { ApplicationConfig, ErrorHandler, importProvidersFrom } from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { provideAnimations } from "@angular/platform-browser/animations";
import { NgxMaskModule } from "ngx-mask";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { GlobalErrorHandlerService } from "@error/services/global-error-handler.service";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { APP_ROUTES } from "./app.routes";
import { API_URL, BearerTokenInterceptor, CamelcaseInterceptor, PRODUCTION } from "@corelib";
import { environment } from "@environment";

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
      provide: API_URL,
      useValue: environment.apiUrl,
    },
    { provide: PRODUCTION, useValue: environment.production },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService,
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(APP_ROUTES),
    provideAnimations(),
  ],
};
