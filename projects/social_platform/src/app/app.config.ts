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
import { AUTH_PROVIDERS } from "./infrastructure/di/auth.providers";
import { FEED_PROVIDERS } from "./infrastructure/di/feed.providers";
import { INDUSTRY_PROVIDERS } from "./infrastructure/di/industry.providers";
import { INVITE_PROVIDERS } from "./infrastructure/di/invite.providers";
import { MEMBER_PROVIDERS } from "./infrastructure/di/member.providers";
import { PROFILE_NEWS_PROVIDERS } from "./infrastructure/di/profile-news.providers";
import { PROGRAM_PROVIDERS } from "./infrastructure/di/program/program.providers";
import { PROGRAM_NEWS_PROVIDERS } from "./infrastructure/di/program/program-news.providers";
import { PROJECT_PROVIDERS } from "./infrastructure/di/project/project.providers";
import { PROJECT_GOALS_PROVIDERS } from "./infrastructure/di/project/project-goals.providers";
import { PROJECT_NEWS_PROVIDERS } from "./infrastructure/di/project/project-news.providers";
import { PROJECT_PROGRAM_PROVIDERS } from "./infrastructure/di/project/project-program.providers";
import { PROJECT_PARTNER_PROVIDERS } from "./infrastructure/di/project/project-partner.providers";
import { PROJECT_RATING_PROVIDERS } from "./infrastructure/di/project/project-rating.providers";
import { PROJECT_RESOURCES_PROVIDERS } from "./infrastructure/di/project/project-resources.providers";
import { PROJECT_SUBSCRIPTION_PROVIDERS } from "./infrastructure/di/project/project-subscription.providers";
import { PROJECT_COLLABORATORS_PROVIDERS } from "./infrastructure/di/project/project-collaborators.providers";
import { SKILLS_PROVIDERS } from "./infrastructure/di/skills.providers";
import { SPECIALIZATIONS_PROVIDERS } from "./infrastructure/di/specializations.providers";
import { VACANCY_PROVIDERS } from "./infrastructure/di/vacancy.providers";

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
    ...AUTH_PROVIDERS,
    ...FEED_PROVIDERS,
    ...INDUSTRY_PROVIDERS,
    ...INVITE_PROVIDERS,
    ...MEMBER_PROVIDERS,
    ...PROFILE_NEWS_PROVIDERS,
    ...PROGRAM_PROVIDERS,
    ...PROGRAM_NEWS_PROVIDERS,
    ...PROJECT_PROVIDERS,
    ...PROJECT_GOALS_PROVIDERS,
    ...PROJECT_NEWS_PROVIDERS,
    ...PROJECT_PARTNER_PROVIDERS,
    ...PROJECT_PROGRAM_PROVIDERS,
    ...PROJECT_RATING_PROVIDERS,
    ...PROJECT_RESOURCES_PROVIDERS,
    ...PROJECT_SUBSCRIPTION_PROVIDERS,
    ...PROJECT_COLLABORATORS_PROVIDERS,
    ...SKILLS_PROVIDERS,
    ...SPECIALIZATIONS_PROVIDERS,
    ...VACANCY_PROVIDERS,
  ],
};
