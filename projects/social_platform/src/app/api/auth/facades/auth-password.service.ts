/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ValidationService } from "@corelib";
import { map, Subject, takeUntil } from "rxjs";
import { AuthService } from "../auth.service";
import { AuthUIInfoService } from "./ui/auth-ui-info.service";

@Injectable()
export class AuthPasswordService {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly validationService = inject(ValidationService);
  private readonly authUIInfoService = inject(AuthUIInfoService);

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

  // ResetPassword Component
  onSubmitResetPassword(resetForm: FormGroup): void {
    if (!this.validationService.getFormValidation(resetForm)) return;

    this.errorServer.set(false);
    this.isSubmitting.set(true);

    this.authService.resetPassword(resetForm.value.email).subscribe({
      next: () => {
        this.router
          .navigate(["/auth/reset_password/confirm"], {
            queryParams: { email: resetForm.value.email },
          })
          .then(() => console.debug("ResetPasswordComponent"));
      },
      error: () => {
        this.errorServer.set(true);
        this.isSubmitting.set(false);

        resetForm.reset();
      },
      complete: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  // SetPassword Component
  onSubmitSetPassword(passwordForm: FormGroup): void {
    this.credsSubmitInitiated.set(true);
    const token = this.route.snapshot.queryParamMap.get("token");

    if (!token || !this.validationService.getFormValidation(passwordForm)) return;

    this.authService.setPassword(passwordForm.value.password, token).subscribe({
      next: () => {
        this.router.navigateByUrl("/auth/login").then(() => console.debug("SetPasswordComponent"));
      },
      error: error => {
        console.error("Error setting password:", error);
        this.errorRequest.set(true);
      },
    });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
