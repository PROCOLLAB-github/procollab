/** @format */

import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import {
  API_URL,
  BearerTokenInterceptor,
  CamelcaseInterceptor,
  PRODUCTION,
  SKILLS_API_URL,
} from "@corelib";
import { environment } from "../environments/environment";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: HTTP_INTERCEPTORS, multi: true, useClass: BearerTokenInterceptor },
    { provide: HTTP_INTERCEPTORS, multi: true, useClass: CamelcaseInterceptor },
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: SKILLS_API_URL, useValue: environment.skillsApiUrl },
    { provide: PRODUCTION, useValue: environment.production },
    provideHttpClient(withInterceptorsFromDi()),
  ],
};
