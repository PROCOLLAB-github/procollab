/** @format */

// Настоящее приложение этой ветки с DEV API через локальный proxy. В production не включается.
import { bootstrapApplication } from "@angular/platform-browser";
import { API_URL } from "@corelib";
import { AppComponent } from "../../../projects/social_platform/src/app/app.component";
import { APP_CONFIG } from "../../../projects/social_platform/src/app/app.config";

bootstrapApplication(AppComponent, {
  ...APP_CONFIG,
  providers: [...APP_CONFIG.providers, { provide: API_URL, useValue: "/dev-api" }],
}).catch(error => console.error(error));
