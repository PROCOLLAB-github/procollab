/** @format */

import { Component, inject, OnInit, signal } from "@angular/core";
import { AsyncPipe, CommonModule } from "@angular/common";
import { Router, RouterLink, RouterOutlet } from "@angular/router";
import { IconComponent, ProfileInfoComponent, SidebarComponent } from "@uilib";
import { SidebarProfileComponent } from "./shared/sidebar-profile/sidebar-profile.component";
import { map, tap } from "rxjs";
import { ProfileService } from "./profile/services/profile.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { User } from "@auth/models/user.model";
import { Profile, UserData } from "../models/profile.model";
import { AuthService } from "@auth/services";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    SidebarComponent,
    SidebarProfileComponent,
    IconComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  profileService = inject(ProfileService);
  authService = inject(AuthService);
  router = inject(Router);

  mobileMenuOpen = false;
  notificationsOpen = false;

  title = "skills";
  navItems = [
    { name: "Навыки", icon: "lib", link: "skills" },
    { name: "Рейтинг", icon: "growth", link: "rating" },
    { name: "Вебинары", icon: "receipt", link: "webinars" },
    { name: "Подписка", icon: "receipt", link: "subscription" },
  ];

  userData = signal<UserData | null>(null);
  logout = signal(false);

  ngOnInit(): void {
    this.profileService.getUserData().subscribe({
      next: data => this.userData.set(data as UserData),
      error: () => {
        location.href = "https://app.procollab.ru/auth/login";
      },
    });
  }
}
