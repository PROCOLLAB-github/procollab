/** @format */

import { Routes } from "@angular/router";
import { AuthComponent } from "./auth.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { EmailVerificationComponent } from "./email-verification/email-verification.component";
import { ConfirmEmailComponent } from "./confirm-email/confirm-email.component";
import { ResetPasswordComponent } from "@auth/reset-password/reset-password.component";
import { SetPasswordComponent } from "@auth/set-password/set-password.component";
import { ConfirmPasswordResetComponent } from "@auth/confirm-password-reset/confirm-password-reset.component";

/**
 * Конфигурация маршрутов для модуля аутентификации
 *
 * Назначение: Определяет все маршруты для страниц аутентификации
 * Принимает: Не принимает параметров
 * Возвращает: Массив конфигураций маршрутов Angular
 *
 * Функциональность:
 * - Настраивает маршруты для входа, регистрации, сброса пароля
 * - Определяет дочерние маршруты для AuthComponent
 * - Настраивает редиректы и компоненты для каждого пути
 */
export const AUTH_ROUTES: Routes = [
  {
    path: "",
    component: AuthComponent,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "login",
      },
      {
        path: "login",
        component: LoginComponent,
      },
      {
        path: "register",
        component: RegisterComponent,
      },
      {
        path: "verification/email",
        component: EmailVerificationComponent,
      },
      {
        path: "reset_password/send_email",
        component: ResetPasswordComponent,
      },
      {
        path: "reset_password",
        component: SetPasswordComponent,
      },
      {
        path: "reset_password/confirm",
        component: ConfirmPasswordResetComponent,
      },
    ],
  },
  {
    path: "verification",
    component: ConfirmEmailComponent,
  },
];
