/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TokenService, ValidationService } from "@corelib";
import { Subject, takeUntil } from "rxjs";
import { AuthUIInfoService } from "./ui/auth-ui-info.service";
import { LoggerService } from "projects/core/src/lib/services/logger/logger.service";
import { AuthRepository } from "../../../infrastructure/repository/auth/auth.repository";
import { LoginUseCase } from "../use-cases/login.use-case";

@Injectable()
export class AuthLoginService {
  private readonly tokenService = inject(TokenService);
  private readonly authRepository = inject(AuthRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly validationService = inject(ValidationService);
  private readonly authUIInfoService = inject(AuthUIInfoService);
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly logger = inject(LoggerService);

  private readonly destroy$ = new Subject<void>();

  private readonly loginForm = this.authUIInfoService.loginForm;

  // Login Component
  readonly showPassword = this.authUIInfoService.showPassword;
  readonly loginIsSubmitting = this.authUIInfoService.loginIsSubmitting;
  readonly errorWrongAuth = this.authUIInfoService.errorWrongAuth;

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    const redirectType = this.route.snapshot.queryParams["redirect"];

    if (!this.validationService.getFormValidation(this.loginForm) || this.loginIsSubmitting()) {
      return;
    }

    this.loginIsSubmitting.set(true);
    this.errorWrongAuth.set(false);

    this.loginUseCase
      .execute(this.loginForm.getRawValue())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.loginIsSubmitting.set(false);

          if (!result.ok) {
            if (result.error.kind === "wrong_credentials") {
              this.errorWrongAuth.set(true);
            }
            return;
          }

          this.tokenService.memTokens(result.value.tokens);

          const url = redirectType === "program" ? "/office/program/list" : "/office";
          this.router
            .navigateByUrl(url)
            .then(() => this.logger.debug("Route changed from LoginComponent"));
        },
      });
  }
}
