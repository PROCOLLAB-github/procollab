/** @format */

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./auth/services";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
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
