/** @format */

import { computed, DestroyRef, inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { tap } from "rxjs";
import { AuthUIInfoService } from "./ui/auth-ui-info.service";
import { ValidationService } from "@corelib";
import { RegisterUseCase } from "../use-cases/register.use-case";
import { toAsyncState } from "@domain/shared/to-async-state";
import { RegisterError } from "@domain/auth/results/register.result";
import { isFailure } from "@domain/shared/async-state";
import { AppRoutes } from "@api/paths/app-routes";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Координирует двухшаговую регистрацию и маппинг серверных ошибок валидации. */
@Injectable()
export class AuthRegisterService {
  private readonly validationService = inject(ValidationService);
  private readonly authUIInfoService = inject(AuthUIInfoService);

  private readonly registerUseCase = inject(RegisterUseCase);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly registerForm = this.authUIInfoService.registerForm;

  readonly registerAgreement = this.authUIInfoService.registerAgreement;
  readonly ageAgreement = this.authUIInfoService.ageAgreement;
  readonly credsSubmitInitiated = this.authUIInfoService.credsSubmitInitiated;
  readonly infoSubmitInitiated = this.authUIInfoService.infoSubmitInitiated;

  readonly showPassword = this.authUIInfoService.showPassword;
  readonly showPasswordRepeat = this.authUIInfoService.showPasswordRepeat;

  readonly register$ = this.authUIInfoService.register$;

  readonly step = this.authUIInfoService.step;

  // Серверные ошибки валидации показываются списком без ручного парсинга в компоненте.
  readonly serverErrors = computed(() => {
    const state = this.register$();
    if (isFailure(state) && state.error.kind === "validation_error") {
      return Object.values(state.error.errors).flat();
    }
    return [];
  });

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
            this.router.navigate([AppRoutes.auth.verifyEmail()], {
              queryParams: { adress: form.email },
            });
          }
        }),
        toAsyncState<void, RegisterError>(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(state => this.register$.set(state));
  }

  downloadPolicy(): void {
    const link = document.createElement("a");
    link.href = "/assets/downloads/auth/shared/privacy_policy_2022.docx";
    link.download = "Политика обработки персональных данных 2022.docx";
    link.click();
  }
}
