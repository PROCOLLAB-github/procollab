/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "../auth.service";
import { ValidationService } from "@corelib";
import { AuthUIInfoService } from "./ui/auth-ui-info.service";
import dayjs from "dayjs";

@Injectable()
export class AuthRegisterService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly validationService = inject(ValidationService);
  private readonly authUIInfoService = inject(AuthUIInfoService);

  readonly registerAgreement = this.authUIInfoService.registerAgreement;
  readonly ageAgreement = this.authUIInfoService.ageAgreement;
  readonly registerIsSubmitting = this.authUIInfoService.registerIsSubmitting;
  readonly credsSubmitInitiated = this.authUIInfoService.credsSubmitInitiated;
  readonly infoSubmitInitiated = this.authUIInfoService.infoSubmitInitiated;

  readonly showPassword = this.authUIInfoService.showPassword;
  readonly showPasswordRepeat = this.authUIInfoService.showPasswordRepeat;

  readonly isUserCreationModalError = this.authUIInfoService.isUserCreationModalError;

  readonly step = this.authUIInfoService.step;

  readonly serverErrors = signal<string[]>([]);

  private readonly destroy$ = new Subject<void>();

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSendForm(registerForm: FormGroup): void {
    const form = this.authUIInfoService.prepareFormValues(registerForm);

    this.registerIsSubmitting.set(true);

    this.authService
      .register(form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.registerIsSubmitting.set(false);
          this.router.navigateByUrl("/auth/verification/email?adress=" + form.email);
        },
        error: error => {
          const emailErrors = error?.error?.email;

          if (error.status === 400 && Array.isArray(emailErrors)) {
            this.serverErrors.set(Object.values(error.error).flat() as string[]);
          } else if (error.status === 500) {
            this.isUserCreationModalError.set(true);
          }

          this.registerIsSubmitting.set(false);
        },
      });
  }
}
