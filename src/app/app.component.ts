/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ResolveEnd, ResolveStart, Router } from "@angular/router";
import { AuthService } from "./auth/services";
import { debounceTime, filter, forkJoin, map, merge, noop, Observable, Subscription } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.rolesSub$ = forkJoin([
      this.authService.getUserRoles(),
      this.authService.getChangableRoles(),
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
  }

  ngOnDestroy(): void {
    this.rolesSub$?.unsubscribe();
  }

  rolesSub$?: Subscription;

  isLoading$?: Observable<boolean>;
  private showLoaderEvents?: Observable<boolean>;

  private hideLoaderEvents?: Observable<boolean>;
}
