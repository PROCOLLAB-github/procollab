/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TokenService } from "@corelib";
import { filter, interval, map } from "rxjs";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ResendEmailUseCase } from "../use-cases/resend-email.use-case";
import { AppRoutes } from "@api/paths/app-routes";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Координирует подтверждение email, сохранение токенов из URL и таймер повторной отправки. */
@Injectable()
export class AuthEmailService {
  private readonly tokenService = inject(TokenService);
  private readonly route = inject(ActivatedRoute);
  private readonly resendEmailUseCase = inject(ResendEmailUseCase);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly userEmail = signal<string | undefined>(undefined);

  readonly counter = signal<number>(0);
  private timerStarted = false;

  initializationTokens(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(queries => {
      const { access_token: accessToken, refresh_token: refreshToken } = queries;
      this.tokenService.memTokens({ access: accessToken, refresh: refreshToken });

      if (this.tokenService.getTokens() !== null) {
        this.router
          .navigateByUrl(AppRoutes.office.root())
          .then(() => this.logger.debug("Route changed from ConfirmEmailComponent"));
      }
    });
  }

  initializationEmail(): void {
    this.route.queryParams
      .pipe(
        map(r => r["adress"]),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(address => {
        this.userEmail.set(address);
      });
  }

  onResend(): void {
    if (!this.userEmail()) return;

    this.resendEmailUseCase
      .execute(this.userEmail()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) return;

        this.counter.set(60);
      });
  }

  initializationTimer(): void {
    if (this.timerStarted) return;
    this.timerStarted = true;
    this.timer$.subscribe();
  }

  timer$ = interval(1000).pipe(
    filter(() => this.counter() > 0),
    map(() => this.counter.update(c => c - 1)),
    takeUntilDestroyed()
  );
}
