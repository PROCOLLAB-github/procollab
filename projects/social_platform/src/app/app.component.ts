/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ResolveEnd, ResolveStart, Router, RouterOutlet } from "@angular/router";
import { AuthService } from "@auth/services";
import {
  debounceTime,
  filter,
  forkJoin,
  fromEvent,
  map,
  merge,
  noop,
  Observable,
  Subscription,
  throttleTime,
} from "rxjs";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { NgIf, AsyncPipe } from "@angular/common";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.scss",
    standalone: true,
    imports: [
        NgIf,
        MatProgressBarModule,
        RouterOutlet,
        AsyncPipe,
    ],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.rolesSub$ = forkJoin([
      this.authService.getUserRoles(),
      this.authService.getChangeableRoles(),
    ]).subscribe(noop);

    this.showLoaderEvents = this.router.events.pipe(
      filter(evt => evt instanceof ResolveStart),
      map(() => true)
    );
    this.hideLoaderEvents = this.router.events.pipe(
      filter(evt => evt instanceof ResolveEnd),
      debounceTime(200),
      map(() => false)
    );

    this.isLoading$ = merge(this.hideLoaderEvents, this.showLoaderEvents);

    if (location.pathname === "/") {
      if (this.authService.getTokens() === null) {
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
    this.appHeight$?.unsubscribe();
  }

  rolesSub$?: Subscription;

  private loadEvent?: Observable<Event>;
  private resizeEvent?: Observable<Event>;

  private appHeight$?: Subscription;

  isLoading$?: Observable<boolean>;
  private showLoaderEvents?: Observable<boolean>;

  private hideLoaderEvents?: Observable<boolean>;
}
