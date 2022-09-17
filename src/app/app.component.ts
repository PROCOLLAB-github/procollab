/** @format */

import { Component, OnInit } from "@angular/core";
import { ResolveEnd, ResolveStart, Router } from "@angular/router";
import { AuthService } from "./auth/services";
import { debounceTime, filter, mapTo, merge, Observable } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  isLoading$?: Observable<boolean>;
  private showLoaderEvents?: Observable<boolean>;
  private hideLoaderEvents?: Observable<boolean>;

  ngOnInit(): void {
    this.showLoaderEvents = this.router.events.pipe(
      filter(evt => evt instanceof ResolveStart),
      mapTo(true)
    );
    this.hideLoaderEvents = this.router.events.pipe(
      filter(evt => evt instanceof ResolveEnd),
      debounceTime(200),
      mapTo(false)
    );

    this.isLoading$ = merge(this.hideLoaderEvents, this.showLoaderEvents);

    if (location.pathname === "/") {
      if (this.authService.getTokens() === null) {
        this.router
          .navigateByUrl("/auth/login")
          .then(() => console.debug("Route changed from AppComponent"));
      } else {
        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed From AppComponent"));
      }
    }
  }
}
