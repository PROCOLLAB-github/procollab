/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { AuthUIInfoService } from "./ui/auth-ui-info.service";
import { ValidationService } from "@corelib";
import { RegisterUseCase } from "../use-cases/register.use-case";

@Injectable()
export class AuthRegisterService {
  private readonly registerUseCase = inject(RegisterUseCase);
  private readonly router = inject(Router);
  private readonly validationService = inject(ValidationService);
  private readonly authUIInfoService = inject(AuthUIInfoService);

  private readonly registerForm = this.authUIInfoService.registerForm;

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

  onSendForm(): void {
    if (!this.validationService.getFormValidation(this.registerForm)) {
      return;
    }

    const form = this.authUIInfoService.prepareFormValues(this.registerForm);

    this.serverErrors.set([]);
    this.isUserCreationModalError.set(false);
    this.registerIsSubmitting.set(true);

    this.registerUseCase
      .execute(form)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          if (!result.ok) {
            if (result.error.kind === "validation_error") {
              this.serverErrors.set(Object.values(result.error.errors).flat());
            } else if (result.error.kind === "server_error") {
              this.isUserCreationModalError.set(true);
            }

            this.registerIsSubmitting.set(false);

            return;
          }

          this.registerIsSubmitting.set(false);
          this.router.navigateByUrl("/auth/verification/email?adress=" + form.email);
        },
      });
  }
}
