/** @format */

import { Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { AuthRequiredGuard } from "@auth/guards/auth-required.guard";

/**
 * Основные маршруты приложения
 *
 * Определяет структуру навигации приложения:
 * - /auth - модуль аутентификации
 * - /office - основной рабочий модуль (требует авторизации)
 * - /error - страницы ошибок
 * - /** - перенаправление на страницу 404
 */

export const APP_ROUTES: Routes = [
  {
    path: "",
    component: AppComponent,
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.routes").then(c => c.AUTH_ROUTES),
  },
  {
    path: "error",
    loadChildren: () => import("./error/error.routes").then(c => c.ERROR_ROUTES),
  },
  {
    path: "office",
    loadChildren: () => import("./office/office.routes").then(c => c.OFFICE_ROUTES),
    canActivate: [AuthRequiredGuard],
  },
  {
    path: "**",
    redirectTo: "error/404",
  },
];
