/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TokenService, ValidationService } from "@corelib";
import { Subject, takeUntil, tap } from "rxjs";
import { AuthUIInfoService } from "./ui/auth-ui-info.service";
import { LoggerService } from "projects/core/src/lib/services/logger/logger.service";
import { LoginUseCase } from "../use-cases/login.use-case";
import { toAsyncState } from "projects/social_platform/src/app/domain/shared/to-async-state";
import {
  LoginResult,
  LoginError,
} from "projects/social_platform/src/app/domain/auth/results/login.result";

@Injectable()
export class AuthLoginService {
  private readonly tokenService = inject(TokenService);
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
  readonly login$ = this.authUIInfoService.login$;

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    const redirectType = this.route.snapshot.queryParams["redirect"];

    if (
      !this.validationService.getFormValidation(this.loginForm) ||
      this.login$().status === "loading"
    ) {
      return;
    }

    this.loginUseCase
      .execute(this.loginForm.getRawValue())
      .pipe(
        tap(result => {
          if (result.ok) {
            this.tokenService.memTokens(result.value.tokens);
            const url = redirectType === "program" ? "/office/program/list" : "/office";
            this.router
              .navigateByUrl(url)
              .then(() => this.logger.debug("Route changed from LoginComponent"));
          }
        }),
        toAsyncState<LoginResult, LoginError>(),
        takeUntil(this.destroy$)
      )
      .subscribe(state => this.login$.set(state));
  }
}
