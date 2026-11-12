/** @format */

import { CanActivateFn, Router, Routes } from "@angular/router";
import { inject } from "@angular/core";
import { InstanceInfoService } from "@api/instance/instance-info.service";
import { authReturnUrl } from "@core/lib/models/auth/auth-return-url";
import { AuthComponent } from "../../pages/auth/auth.component";
import { ResetPasswordComponent } from "@ui/pages/auth/reset-password/reset-password.component";
import { SetPasswordComponent } from "@ui/pages/auth/set-password/set-password.component";
import { ConfirmPasswordResetComponent } from "@ui/pages/auth/confirm-password-reset/confirm-password-reset.component";
import { LoginComponent } from "@ui/pages/auth/login/login.component";
import { RegisterComponent } from "@ui/pages/auth/register/register.component";
import { EmailVerificationComponent } from "@ui/pages/auth/email-verification/email-verification.component";
import { ConfirmEmailComponent } from "@ui/pages/auth/confirm-email/confirm-email.component";

/** Общие ссылки входа в экземпляре открывают существующую клиентскую форму. */
function instanceAuthForm(mode: "login" | "reset"): CanActivateFn {
  return route => {
    const instance = inject(InstanceInfoService);
    if (!instance.enabled()) return true;
    const returnUrl = authReturnUrl(route.queryParamMap.get("returnUrl"));
    return inject(Router).createUrlTree([instance.registrationUrl()], {
      queryParams: { mode, ...(returnUrl ? { returnUrl } : {}) },
    });
  };
}

/** Конфигурация маршрутов для модуля аутентификации. */
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
        canActivate: [instanceAuthForm("login")],
      },
      {
        path: "register",
        component: RegisterComponent,
        canActivate: [
          () => {
            const instance = inject(InstanceInfoService);
            return instance.enabled() ? inject(Router).parseUrl(instance.registrationUrl()) : true;
          },
        ],
      },
      {
        path: "verification/email",
        component: EmailVerificationComponent,
      },
      {
        path: "reset_password/send_email",
        component: ResetPasswordComponent,
        canActivate: [instanceAuthForm("reset")],
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
