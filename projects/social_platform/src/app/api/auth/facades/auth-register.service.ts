/** @format */

import { computed, inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, takeUntil, tap } from "rxjs";
import { AuthUIInfoService } from "./ui/auth-ui-info.service";
import { ValidationService } from "@corelib";
import { RegisterUseCase } from "../use-cases/register.use-case";
import { toAsyncState } from "../../../domain/shared/to-async-state";
import { RegisterError } from "../../../domain/auth/results/register.result";
import { isFailure } from "../../../domain/shared/async-state";

@Injectable()
export class AuthRegisterService {
  private readonly registerUseCase = inject(RegisterUseCase);
  private readonly router = inject(Router);
  private readonly validationService = inject(ValidationService);
  private readonly authUIInfoService = inject(AuthUIInfoService);

  private readonly registerForm = this.authUIInfoService.registerForm;

  readonly registerAgreement = this.authUIInfoService.registerAgreement;
  readonly ageAgreement = this.authUIInfoService.ageAgreement;
  readonly credsSubmitInitiated = this.authUIInfoService.credsSubmitInitiated;
  readonly infoSubmitInitiated = this.authUIInfoService.infoSubmitInitiated;

  readonly showPassword = this.authUIInfoService.showPassword;
  readonly showPasswordRepeat = this.authUIInfoService.showPasswordRepeat;

  readonly register$ = this.authUIInfoService.register$;

  readonly step = this.authUIInfoService.step;

  // Вычисляемое из AsyncState — автоматически обновляется при смене состояния
  readonly serverErrors = computed(() => {
    const state = this.register$();
    if (isFailure(state) && state.error.kind === "validation_error") {
      return Object.values(state.error.errors).flat();
    }
    return [];
  });

  private readonly destroy$ = new Subject<void>();

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSendForm(): void {
    if (
      !this.validationService.getFormValidation(this.registerForm) ||
      this.register$().status === "loading"
    ) {
      return;
    }

    const form = this.authUIInfoService.prepareFormValues(this.registerForm);

    this.registerUseCase
      .execute(form)
      .pipe(
        tap(result => {
          if (result.ok) {
            this.router.navigateByUrl("/auth/verification/email?adress=" + form.email);
          }
        }),
        toAsyncState<void, RegisterError>(),
        takeUntil(this.destroy$)
      )
      .subscribe(state => this.register$.set(state));
  }
}
