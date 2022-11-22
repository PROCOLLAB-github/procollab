/** @format */

import { Component, OnInit } from "@angular/core";
import { AuthService } from "../services";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-confirm-email",
  templateUrl: "./confirm-email.component.html",
  styleUrls: ["./confirm-email.component.scss"],
})
export class ConfirmEmailComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(queries => {
      const { access_token: accessToken, refresh_token: refreshToken } = queries;
      this.authService.memTokens({ access: accessToken, refresh: refreshToken });

      if (this.authService.getTokens() !== null) {
        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed from ConfirmEmailComponent"));
      }
    });
  }
}
