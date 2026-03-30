/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ValidationService } from "@corelib";
import { map, Subject, takeUntil, tap } from "rxjs";
import { AuthUIInfoService } from "./ui/auth-ui-info.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ResetPasswordUseCase } from "../use-cases/reset-password.use-case";
import { SetPasswordUseCase } from "../use-cases/set-password.use-case";
import { toAsyncState } from "@domain/shared/to-async-state";
import { PasswordError } from "@domain/auth/results/password.result";

@Injectable()
export class AuthPasswordService {
  private readonly route = inject(ActivatedRoute);
  private readonly resetPasswordUseCase = inject(ResetPasswordUseCase);
  private readonly setPasswordUseCase = inject(SetPasswordUseCase);
  private readonly router = inject(Router);
  private readonly validationService = inject(ValidationService);
  private readonly authUIInfoService = inject(AuthUIInfoService);
  private readonly logger = inject(LoggerService);

  private readonly passwordForm = this.authUIInfoService.passwordForm;
  private readonly resetForm = this.authUIInfoService.resetForm;

  private readonly destroy$ = new Subject<void>();

  // ResetPassword-Confirmation Component
  readonly email = this.route.queryParams.pipe(
    map(r => r["email"]),
    takeUntil(this.destroy$)
  );

  // ResetPassword Component
  readonly password$ = this.authUIInfoService.password$;

  readonly credsSubmitInitiated = this.authUIInfoService.credsSubmitInitiated;

  init(): void {
    const token = this.route.snapshot.queryParamMap.get("token");
    if (!token) {
      // Handle the case where token is not present
      this.logger.error("Token is missing");
    }
  }

  // ResetPassword Component
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
              .navigate(["/auth/reset_password/confirm"], {
                queryParams: { email: this.resetForm.value.email },
              })
              .then(() => this.logger.debug("ResetPasswordComponent"));
          } else {
            this.resetForm.reset();
          }
        }),
        toAsyncState<void, PasswordError>(),
        takeUntil(this.destroy$)
      )
      .subscribe({ next: result => this.password$.set(result) });
  }

  // SetPassword Component
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
              .navigateByUrl("/auth/login")
              .then(() => this.logger.debug("SetPasswordComponent"));
          } else {
            this.logger.error("Error setting password:", result.error);
          }
        }),
        toAsyncState<void, PasswordError>(),
        takeUntil(this.destroy$)
      )
      .subscribe({ next: result => this.password$.set(result) });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
