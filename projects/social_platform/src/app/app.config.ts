/** @format */

import { ApplicationConfig, ErrorHandler, importProvidersFrom, LOCALE_ID } from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { provideAnimations } from "@angular/platform-browser/animations";
import { NgxMaskModule } from "ngx-mask";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { GlobalErrorHandlerService } from "projects/core/src/lib/services/error/global-error-handler.service";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { provideRouter, withRouterConfig } from "@angular/router";
import { APP_ROUTES } from "./app.routes";
import {
  API_URL,
  BearerTokenInterceptor,
  CamelcaseInterceptor,
  PRODUCTION,
  SKILLS_API_URL,
} from "@corelib";
import { environment } from "@environment";
import { registerLocaleData } from "@angular/common";
import localeRu from "@angular/common/locales/ru";

registerLocaleData(localeRu, "ru-RU");

export const APP_CONFIG: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: "ru-RU" },
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
    {
      provide: SKILLS_API_URL,
      useValue: environment.skillsApiUrl,
    },
    { provide: PRODUCTION, useValue: environment.production },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService,
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(
      APP_ROUTES,
      withRouterConfig({
        onSameUrlNavigation: "reload",
      })
    ),
    provideAnimations(),
  ],
};
