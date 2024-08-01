/** @format */

import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterOutlet } from "@angular/router";
import { SidebarComponent } from "@uilib";
import { SidebarProfileComponent } from "./shared/sidebar-profile/sidebar-profile.component";
import { map, tap } from "rxjs";
import { ProfileService } from "./profile/services/profile.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { User } from "@auth/models/user.model";
import { Profile, UserData } from "../models/profile.model";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, SidebarProfileComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  profileService = inject(ProfileService);
  router = inject(Router);

  title = "skills";
  navItems = [
    { name: "Навыки", icon: "lib", link: "/skills" },
    { name: "Рейтинг", icon: "growth", link: "rating" },
    { name: "Подписка", icon: "receipt", link: "subscription" },
  ];

  userData = signal<UserData | null>(null);
  logout = signal(false);

  ngOnInit(): void {
    this.profileService.getUserData().subscribe(data => this.userData.set(data as UserData));
  }
}
