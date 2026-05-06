/** @format */

import { ChangeDetectionStrategy, Component, inject, OnInit, DestroyRef } from "@angular/core";
import { ResolveEnd, ResolveStart, Router, RouterOutlet } from "@angular/router";
import {
  debounceTime,
  filter,
  forkJoin,
  fromEvent,
  map,
  merge,
  noop,
  type Observable,
  throttleTime,
} from "rxjs";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { AsyncPipe, NgIf } from "@angular/common";
import { LoggerService, TokenService } from "@corelib";
import { CookieConsentComponent } from "@ui/widgets/cookie-consent/cookie-consent.component";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { LoadingService } from "@ui/services/loading/loading.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AppRoutes } from "@api/paths/app-routes";

/**
 * Корневой компонент приложения
 *
 * Основной компонент, который служит точкой входа в приложение.
 * Содержит router-outlet для отображения различных страниц приложения.
 */
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: true,
  imports: [NgIf, MatProgressBarModule, RouterOutlet, AsyncPipe, CookieConsentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private authRepository: AuthRepositoryPort,
    private tokenService: TokenService,
    private router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    forkJoin([this.authRepository.fetchUserRoles(), this.authRepository.fetchChangeableRoles()])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(noop);

    const showLoaderEvents = this.router.events.pipe(
      filter(evt => evt instanceof ResolveStart),
      map(() => true)
    );

    const hideLoaderEvents = this.router.events.pipe(
      filter(evt => evt instanceof ResolveEnd),
      debounceTime(200),
      map(() => false)
    );

    merge(hideLoaderEvents, showLoaderEvents)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isLoading => {
        if (isLoading) {
          this.loadingService.show();
        } else {
          this.loadingService.hide();
        }
      });

    this.isLoading$ = this.loadingService.isLoading$;

    if (location.pathname === "/") {
      if (this.tokenService.getTokens() === null) {
        this.router
          .navigateByUrl(AppRoutes.auth.login())
          .then(() => this.logger.debug("Route changed from AppComponent"));
      } else {
        this.logger.debug("Route start changing from AppComponent");
        this.router
          .navigateByUrl(AppRoutes.office.root())
          .then(() => this.logger.debug("Route changed From AppComponent"));
      }
    }

    const loadEvent = fromEvent(window, "load");
    const resizeEvent = fromEvent(window, "resize").pipe(throttleTime(500));

    merge(loadEvent, resizeEvent)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
      });
  }

  isLoading$?: Observable<boolean>;
}
