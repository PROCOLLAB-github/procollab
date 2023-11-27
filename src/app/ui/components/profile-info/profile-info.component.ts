/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { Router } from "@angular/router";

@Component({
  selector: "app-profile-info",
  templateUrl: "./profile-info.component.html",
  styleUrl: "./profile-info.component.scss",
})
export class ProfileInfoComponent implements OnInit {
  constructor(private readonly authService: AuthService, readonly router: Router) {}

  ngOnInit(): void {}

  @Input() user?: User;

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router
        .navigateByUrl("/auth")
        .then(() => console.debug("Route changed from ProfileInfoComponent"));
    });
  }
}
