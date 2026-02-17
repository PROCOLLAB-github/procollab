/** @format */

import { Component, inject, type OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink, RouterOutlet } from "@angular/router";
import { IconComponent, ProfileControlPanelComponent, SidebarComponent } from "@uilib";
import { SidebarProfileComponent } from "./shared/sidebar-profile/sidebar-profile.component";
import { ProfileService } from "./profile/services/profile.service";
import type { UserData } from "../models/profile.model";
import { AuthService } from "@auth/services";

/**
 * Корневой компонент приложения, который служит основным контейнером макета
 *
 * Функции:
 * - Основная навигационная боковая панель
 * - Отображение профиля пользователя
 * - Обработка мобильного меню
 * - Управление состоянием аутентификации
 * - Рендеринг контента на основе маршрутов
 *
 * Компонент инициализирует данные пользователя при запуске и обрабатывает
 * перенаправления аутентификации, если пользователь не авторизован должным образом.
 */
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
    ProfileControlPanelComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  // Внедренные сервисы для управления профилем и аутентификацией
  profileService = inject(ProfileService);
  authService = inject(AuthService);
  router = inject(Router);

  // Управление состоянием UI
  mobileMenuOpen = false;
  notificationsOpen = false;

  // Конфигурация приложения
  title = "skills";

  /**
   * Конфигурация элементов навигации
   * Каждый элемент представляет основной раздел приложения
   */
  navItems = [
    { name: "Мой профиль", icon: "person", link: "profile" },
    { name: "Рейтинг", icon: "growth", link: "rating" },
    { name: "Траектории", icon: "receipt", link: "trackCar" },
  ];

  // Реактивное состояние с использованием Angular signals
  userData = signal<UserData | null>(null);
  logout = signal(false);

  /**
   * Инициализация компонента
   * Получает данные пользователя и синхронизирует профиль при запуске
   * Перенаправляет на страницу входа при ошибке аутентификации
   */
  ngOnInit(): void {
    // Получение текущих данных пользователя
    this.profileService.getUserData().subscribe({
      next: data => this.userData.set(data as UserData),
      error: () => {
        // Перенаправление на основное приложение для входа при ошибке получения данных пользователя
        location.href = "https://app.procollab.ru/auth/login";
      },
    });

    // Синхронизация данных профиля с бэкендом
    this.profileService.syncProfile().subscribe({
      next: () => {
        // Синхронизация профиля успешна - никаких действий не требуется
      },
      error: () => {
        // Перенаправление на основное приложение для входа при ошибке синхронизации профиля
        location.href = "https://app.procollab.ru/auth/login";
      },
    });
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        location.href = "https://app.procollab.ru/auth/login";
      },
    });
  }
}
