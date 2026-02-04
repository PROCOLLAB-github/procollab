/** @format */

import { inject, Injectable } from "@angular/core";
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
      console.error("Token is missing");
    }
  }

  // ResetPassword Component
  onSubmitResetPassword(): void {
    if (!this.validationService.getFormValidation(this.resetForm)) return;

    this.errorServer.set(false);
    this.isSubmitting.set(true);

    this.authService.resetPassword(this.resetForm.value.email!).subscribe({
      next: () => {
        this.router
          .navigate(["/auth/reset_password/confirm"], {
            queryParams: { email: this.resetForm.value.email },
          })
          .then(() => console.debug("ResetPasswordComponent"));
      },
      error: () => {
        this.errorServer.set(true);
        this.isSubmitting.set(false);

        this.resetForm.reset();
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

    this.authService.setPassword(this.passwordForm.value.password!, token).subscribe({
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
