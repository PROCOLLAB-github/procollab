/** @format */

import { Routes } from "@angular/router";
import { ProfileHomeComponent } from "./profile-home.component";

/**
 * Конфигурация маршрутов для домашней страницы профиля
 *
 * Определяет маршрут для главной страницы профиля пользователя.
 * Используется как дочерний маршрут в основной конфигурации профиля.
 *
 * @returns {Routes} Массив конфигураций маршрутов домашней страницы
 */
export const PROFILE_HOME_ROUTES: Routes = [
  {
    path: "",
    component: ProfileHomeComponent,
  },
];
