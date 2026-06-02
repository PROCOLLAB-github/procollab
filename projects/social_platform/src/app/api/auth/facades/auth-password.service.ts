/** @format */

import { DestroyRef, inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ValidationService } from "@corelib";
import { map, tap } from "rxjs";
import { AuthUIInfoService } from "./ui/auth-ui-info.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ResetPasswordUseCase } from "../use-cases/reset-password.use-case";
import { SetPasswordUseCase } from "../use-cases/set-password.use-case";
import { toAsyncState } from "@domain/shared/to-async-state";
import { PasswordError } from "@domain/auth/results/password.result";
import { AppRoutes } from "@api/paths/app-routes";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Управляет сбросом и установкой пароля, а также состоянием форм пароля. */
@Injectable()
export class AuthPasswordService {
  private readonly route = inject(ActivatedRoute);
  private readonly resetPasswordUseCase = inject(ResetPasswordUseCase);
  private readonly setPasswordUseCase = inject(SetPasswordUseCase);
  private readonly router = inject(Router);
  private readonly validationService = inject(ValidationService);
  private readonly authUIInfoService = inject(AuthUIInfoService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly passwordForm = this.authUIInfoService.passwordForm;
  private readonly resetForm = this.authUIInfoService.resetForm;

  readonly email = this.route.queryParams.pipe(
    map(r => r["email"]),
    takeUntilDestroyed(),
  );

  readonly password$ = this.authUIInfoService.password$;

  readonly credsSubmitInitiated = this.authUIInfoService.credsSubmitInitiated;

  init(): void {
    const token = this.route.snapshot.queryParamMap.get("token");
    if (!token) {
      this.logger.error("Token is missing");
    }
  }

  onSubmitResetPassword(): void {
    if (
      !this.validationService.getFormValidation(this.resetForm) ||
      this.password$().status === "loading"
    )
      return;

    this.resetPasswordUseCase
      .execute(this.resetForm.value.email!)
      .pipe(
        tap(result => {
          if (result.ok) {
            this.router
              .navigate([AppRoutes.auth.resetPasswordConfirm()], {
                queryParams: { email: this.resetForm.value.email },
              })
              .then(() => this.logger.debug("ResetPasswordComponent"));
          } else {
            this.resetForm.reset();
          }
        }),
        toAsyncState<void, PasswordError>(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({ next: result => this.password$.set(result) });
  }

  onSubmitSetPassword(): void {
    this.credsSubmitInitiated.set(true);
    const token = this.route.snapshot.queryParamMap.get("token");

    if (
      !token ||
      !this.validationService.getFormValidation(this.passwordForm) ||
      this.password$().status === "loading"
    )
      return;

    this.setPasswordUseCase
      .execute(this.passwordForm.value.password!, token)
      .pipe(
        tap(result => {
          if (result.ok) {
            this.router
              .navigateByUrl(AppRoutes.auth.login())
              .then(() => this.logger.debug("SetPasswordComponent"));
          } else {
            this.logger.error("Error setting password:", result.error);
          }
        }),
        toAsyncState<void, PasswordError>(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({ next: result => this.password$.set(result) });
  }
}
