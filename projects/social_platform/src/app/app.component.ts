/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
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
  type Subscription,
  throttleTime,
} from "rxjs";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { AsyncPipe, NgIf } from "@angular/common";
import { TokenService } from "@corelib";
import { LoadingService } from "@ui/services/loading/loading.service";
import { AuthService } from "./api/auth";

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
  imports: [NgIf, MatProgressBarModule, RouterOutlet, AsyncPipe],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.rolesSub$ = forkJoin([
      this.authService.getUserRoles(),
      this.authService.getChangeableRoles(),
    ]).subscribe(noop);

    const showLoaderEvents = this.router.events.pipe(
      filter(evt => evt instanceof ResolveStart),
      map(() => true)
    );

    const hideLoaderEvents = this.router.events.pipe(
      filter(evt => evt instanceof ResolveEnd),
      debounceTime(200),
      map(() => false)
    );

    this.routerLoadingSub$ = merge(hideLoaderEvents, showLoaderEvents).subscribe(isLoading => {
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
          .navigateByUrl("/auth/login")
          .then(() => console.debug("Route changed from AppComponent"));
      } else {
        console.debug("Route start changing from AppComponent");
        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed From AppComponent"));
      }
    }

    this.loadEvent = fromEvent(window, "load");
    this.resizeEvent = fromEvent(window, "resize").pipe(throttleTime(500));

    this.appHeight$ = merge(this.loadEvent, this.resizeEvent).subscribe(() => {
      document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
    });
  }

  ngOnDestroy(): void {
    this.rolesSub$?.unsubscribe();
    this.routerLoadingSub$?.unsubscribe();
    this.appHeight$?.unsubscribe();
  }

  rolesSub$?: Subscription;
  routerLoadingSub$?: Subscription;

  private loadEvent?: Observable<Event>;
  private resizeEvent?: Observable<Event>;

  private appHeight$?: Subscription;

  isLoading$?: Observable<boolean>;
}
