/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ValidationService } from "@corelib";
import { map, Subject, takeUntil } from "rxjs";
import { AuthUIInfoService } from "./ui/auth-ui-info.service";
import { LoggerService } from "projects/core/src/lib/services/logger/logger.service";
import { ResetPasswordUseCase } from "../use-cases/reset-password.use-case";
import { SetPasswordUseCase } from "../use-cases/set-password.use-case";

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
  readonly isSubmitting = this.authUIInfoService.isSubmitting;
  readonly errorRequest = this.authUIInfoService.errorRequest;
  readonly credsSubmitInitiated = this.authUIInfoService.credsSubmitInitiated;
  private readonly errorServer = this.authUIInfoService.errorServer;

  init(): void {
    const token = this.route.snapshot.queryParamMap.get("token");
    if (!token) {
      // Handle the case where token is not present
      this.logger.error("Token is missing");
    }
  }

  // ResetPassword Component
  onSubmitResetPassword(): void {
    if (!this.validationService.getFormValidation(this.resetForm)) return;

    this.errorServer.set(false);
    this.isSubmitting.set(true);

    this.resetPasswordUseCase
      .execute(this.resetForm.value.email!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.errorServer.set(true);
            this.resetForm.reset();
            return;
          }

          this.router
            .navigate(["/auth/reset_password/confirm"], {
              queryParams: { email: this.resetForm.value.email },
            })
            .then(() => this.logger.debug("ResetPasswordComponent"));
        },
        complete: () => {
          this.isSubmitting.set(false);
        },
      });
  }

  // SetPassword Component
  onSubmitSetPassword(): void {
    this.credsSubmitInitiated.set(true);
    const token = this.route.snapshot.queryParamMap.get("token");

    if (!token || !this.validationService.getFormValidation(this.passwordForm)) return;

    this.setPasswordUseCase
      .execute(this.passwordForm.value.password!, token)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.logger.error("Error setting password:", result.error.cause);
            this.errorRequest.set(true);
            return;
          }

          this.router
            .navigateByUrl("/auth/login")
            .then(() => this.logger.debug("SetPasswordComponent"));
        },
      });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
