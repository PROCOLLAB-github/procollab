/** @format */

import { DestroyRef, inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TokenService, ValidationService } from "@corelib";
import { tap } from "rxjs";
import { AuthUIInfoService } from "./ui/auth-ui-info.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { LoginUseCase } from "../use-cases/login.use-case";
import { toAsyncState } from "@domain/shared/to-async-state";
import { LoginResult, LoginError } from "@domain/auth/results/login.result";
import { AppRoutes } from "@api/paths/app-routes";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Фасад входа: форма логина, `LoginUseCase`, состояние отправки и редирект. */
@Injectable()
export class AuthLoginService {
  private readonly tokenService = inject(TokenService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly validationService = inject(ValidationService);
  private readonly authUIInfoService = inject(AuthUIInfoService);
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly profileInfoService = inject(ProfileInfoService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly loginForm = this.authUIInfoService.loginForm;

  // Login Component
  readonly showPassword = this.authUIInfoService.showPassword;
  readonly login$ = this.authUIInfoService.login$;

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
            this.profileInfoService.invalidateProfile();
            this.profileInfoService.invalidateLeaderProjects();
            this.profileInfoService.ensureProfileLoaded();

            const url =
              redirectType === "program" ? AppRoutes.program.root() : AppRoutes.office.root();
            this.router
              .navigateByUrl(url)
              .then(() => this.logger.debug("Route changed from LoginComponent"));
          }
        }),
        toAsyncState<LoginResult, LoginError>(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(state => this.login$.set(state));
  }
}
