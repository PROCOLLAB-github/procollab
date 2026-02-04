/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TokenService, ValidationService } from "@corelib";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "../auth.service";
import { AuthUIInfoService } from "./ui/auth-ui-info.service";
import { LoginRequest } from "../../../domain/auth/http.model";

@Injectable()
export class AuthLoginService {
  private readonly tokenService = inject(TokenService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly validationService = inject(ValidationService);
  private readonly authUIInfoService = inject(AuthUIInfoService);

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

    this.authService
      .login(this.loginForm.value as LoginRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.tokenService.memTokens(res);
          this.loginIsSubmitting.set(false);

          if (!redirectType)
            this.router
              .navigateByUrl("/office")
              .then(() => console.debug("Route changed from LoginComponent"));
          else if (redirectType === "program")
            this.router
              .navigateByUrl("/office/program/list")
              .then(() => console.debug("Route changed from LoginComponent"));
        },
        error: error => {
          if (error.status === 401) {
            this.errorWrongAuth.set(true);
          }

          this.loginIsSubmitting.set(false);
        },
      });
  }
}
