/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { AuthService } from "@auth/services";
import { Router, RouterLink } from "@angular/router";
import { DayjsPipe } from "projects/core";
import { IconComponent } from "@ui/components";
import { AvatarComponent } from "../avatar/avatar.component";
import { User } from "@auth/models/user.model";

@Component({
  selector: "app-profile-info",
  templateUrl: "./profile-info.component.html",
  styleUrl: "./profile-info.component.scss",
  standalone: true,
  imports: [RouterLink, AvatarComponent, IconComponent, DayjsPipe],
})
export class ProfileInfoComponent implements OnInit {
  constructor(private readonly authService: AuthService, readonly router: Router) {}

  ngOnInit(): void {}

  @Input({ required: true }) user!: User;

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router
        .navigateByUrl("/auth")
        .then(() => console.debug("Route changed from ProfileInfoComponent"));
    });
  }
}
