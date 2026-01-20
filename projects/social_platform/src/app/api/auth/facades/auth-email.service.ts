/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TokenService } from "@corelib";
import { filter, interval, map, Subject, takeUntil } from "rxjs";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthEmailService {
  private readonly tokenService = inject(TokenService);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();

  // ConfirmEmail Component
  private readonly userEmail = signal<string | undefined>(undefined);

  // VerificationEmail Component
  readonly counter = signal<number>(0);
  private timerStarted = false;

  // ConfirmEmail Component

  initializationTokens(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(queries => {
      const { access_token: accessToken, refresh_token: refreshToken } = queries;
      this.tokenService.memTokens({ access: accessToken, refresh: refreshToken });

      if (this.tokenService.getTokens() !== null) {
        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed from ConfirmEmailComponent"));
      }
    });
  }

  // VerificationEmail Component

  initializationEmail(): void {
    this.route.queryParams
      .pipe(
        map(r => r["adress"]),
        takeUntil(this.destroy$)
      )
      .subscribe(address => {
        this.userEmail.set(address);
      });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onResend(): void {
    if (!this.userEmail()) return;

    this.authService
      .resendEmail(this.userEmail()!)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
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
    takeUntil(this.destroy$)
  );
}
