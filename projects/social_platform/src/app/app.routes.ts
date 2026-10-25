/** @format */

import { Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { AuthRequiredGuard } from "@core/lib/guards/auth/auth-required.guard";
import { PUBLISHED_SOLUTION_ROUTES } from "./ui/routes/program/published-solutions.routes";

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
  ...PUBLISHED_SOLUTION_ROUTES,
  {
    path: "program-registration/:id",
    loadComponent: () =>
      import("./ui/pages/program/registration/public-registration.component").then(
        c => c.PublicRegistrationComponent,
      ),
  },
  {
    path: "program-password-reset",
    loadComponent: () => import("./ui/pages/auth/auth.component").then(c => c.AuthComponent),
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./ui/pages/auth/set-password/set-password.component").then(
            c => c.SetPasswordComponent,
          ),
      },
    ],
  },
  {
    path: "organizer-password-reset",
    loadComponent: () => import("./ui/pages/auth/auth.component").then(c => c.AuthComponent),
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./ui/pages/auth/set-password/set-password.component").then(
            c => c.SetPasswordComponent,
          ),
      },
    ],
  },
  {
    path: "organizer-invitation/:token",
    data: { invitationRole: "organizer" },
    loadComponent: () =>
      import("./ui/pages/evaluation/invitation/expert-invitation.component").then(
        c => c.ExpertInvitationComponent,
      ),
  },
  {
    path: "expert-password-reset",
    loadComponent: () => import("./ui/pages/auth/auth.component").then(c => c.AuthComponent),
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./ui/pages/auth/set-password/set-password.component").then(
            c => c.SetPasswordComponent,
          ),
      },
    ],
  },
  {
    path: "expert-invitation/:token",
    loadComponent: () =>
      import("./ui/pages/evaluation/invitation/expert-invitation.component").then(
        c => c.ExpertInvitationComponent,
      ),
  },
  {
    path: "",
    component: AppComponent,
  },
  {
    path: "auth",
    loadChildren: () => import("./ui/routes/auth/auth.routes").then(c => c.AUTH_ROUTES),
  },
  {
    path: "error",
    loadChildren: () => import("./ui/routes/error/error.routes").then(c => c.ERROR_ROUTES),
  },
  {
    path: "office",
    loadChildren: () => import("./ui/routes/office/office.routes").then(c => c.OFFICE_ROUTES),
    canActivate: [AuthRequiredGuard],
  },
  {
    path: "**",
    redirectTo: "error/404",
  },
];
