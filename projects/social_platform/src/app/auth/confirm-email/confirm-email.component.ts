/** @format */

import { Component, OnInit } from "@angular/core";
import { AuthService } from "../services";
import { ActivatedRoute, Router } from "@angular/router";
import { TokenService } from "@corelib";

@Component({
  selector: "app-confirm-email",
  templateUrl: "./confirm-email.component.html",
  styleUrl: "./confirm-email.component.scss",
  standalone: true,
})
export class ConfirmEmailComponent implements OnInit {
  constructor(
    private tokenService: TokenService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(queries => {
      const { access_token: accessToken, refresh_token: refreshToken } = queries;
      this.tokenService.memTokens({ access: accessToken, refresh: refreshToken });

      if (this.tokenService.getTokens() !== null) {
        this.router
          .navigateByUrl("/office")
          .then(() => console.debug("Route changed from ConfirmEmailComponent"));
      }
    });
  }
}
