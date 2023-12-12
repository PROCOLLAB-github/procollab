/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { Router, RouterLink } from "@angular/router";
import { DayjsPipe } from "@core/pipes/dayjs.pipe";
import { IconComponent } from "@ui/components";
import { AvatarComponent } from "../avatar/avatar.component";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-profile-info",
  templateUrl: "./profile-info.component.html",
  styleUrl: "./profile-info.component.scss",
  standalone: true,
  imports: [NgIf, RouterLink, AvatarComponent, IconComponent, DayjsPipe],
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
