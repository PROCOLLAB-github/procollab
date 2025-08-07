/** @format */

import { Component, EventEmitter, inject, type OnInit, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent, IconComponent } from "@uilib";
import { DayjsPipe } from "@corelib";
import { RouterLink } from "@angular/router";
import type { UserData } from "projects/skills/src/models/profile.model";
import { ProfileService } from "../../profile/services/profile.service";

/**
 * Компонент профиля пользователя в боковой панели
 *
 * Отображает информацию о текущем пользователе в боковой панели приложения.
 * Загружает данные пользователя при инициализации и предоставляет возможность выхода из системы.
 *
 * @example
 * <app-sidebar-profile (logout)="handleLogout()"></app-sidebar-profile>
 */
@Component({
  selector: "app-sidebar-profile",
  standalone: true,
  imports: [CommonModule, IconComponent, AvatarComponent, DayjsPipe, RouterLink],
  templateUrl: "./sidebar-profile.component.html",
  styleUrl: "./sidebar-profile.component.scss",
})
export class SidebarProfileComponent implements OnInit {
  /**
   * Событие выхода из системы
   * Эмитится когда пользователь нажимает на кнопку выхода
   */
  @Output() logout = new EventEmitter();

  /**
   * Сигнал с данными пользователя
   * Содержит информацию о текущем авторизованном пользователе или null если данные не загружены
   */
  user = signal<UserData | null>(null);

  /**
   * Сервис для работы с профилем пользователя
   * Инжектируется автоматически через DI контейнер Angular
   */
  profileService = inject(ProfileService);

  /**
   * Инициализация компонента
   *
   * Загружает данные пользователя при создании компонента.
   * В случае ошибки перенаправляет на страницу авторизации.
   *
   * @returns void
   */
  ngOnInit(): void {
    this.profileService.getUserData().subscribe({
      next: data => this.user.set(data as UserData),
      error: () => {
        // Перенаправление на страницу авторизации при ошибке загрузки данных
        location.href = "https://app.procollab.ru/auth/login";
      },
    });
  }
}
