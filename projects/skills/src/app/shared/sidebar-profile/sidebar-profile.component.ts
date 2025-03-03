/** @format */

import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent, IconComponent } from "@uilib";
import { DayjsPipe } from "@corelib";
import { RouterLink } from "@angular/router";
import { Profile, UserData } from "projects/skills/src/models/profile.model";
import { User } from "@auth/models/user.model";
import { ProfileService } from "../../profile/services/profile.service";

@Component({
  selector: "app-sidebar-profile",
  standalone: true,
  imports: [CommonModule, IconComponent, AvatarComponent, DayjsPipe, RouterLink],
  templateUrl: "./sidebar-profile.component.html",
  styleUrl: "./sidebar-profile.component.scss",
})
export class SidebarProfileComponent implements OnInit {
  @Output() logout = new EventEmitter();

  user = signal<UserData | null>(null);
  profileService = inject(ProfileService);

  ngOnInit(): void {
    this.profileService.getUserData().subscribe({
      next: data => this.user.set(data as UserData),
      error: () => {
        location.href = "https://app.procollab.ru/auth/login";
      },
    });
  }
}
