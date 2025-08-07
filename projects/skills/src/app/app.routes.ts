/** @format */

import type { Routes } from "@angular/router";

/**
 * Основная конфигурация маршрутизации приложения
 *
 * Использует ленивую загрузку для всех функциональных модулей для оптимизации размера начального бандла
 * Каждый маршрут загружает свой модуль только при обращении, что улучшает производительность
 *
 * Структура маршрутов:
 * - / (корень) -> перенаправляет на профиль
 * - /profile -> Управление профилем пользователя
 * - /skills -> Просмотр и управление навыками
 * - /rating -> Рейтинги пользователей и таблицы лидеров
 * - /task -> Интерактивные обучающие задания
 * - /trackBuss -> Бизнес-траектория (в настоящее время отключена)
 * - /trackCar -> Карьерная траектория
 * - /subscription -> Управление подписками
 * - /webinars -> Система вебинаров
 */
export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "profile", // Маршрут по умолчанию перенаправляет на профиль пользователя
  },
  {
    path: "profile",
    loadChildren: () => import("./profile/profile.routes").then(c => c.PROFILE_ROUTES),
  },
  {
    path: "skills",
    loadChildren: () => import("./skills/skills.routes").then(c => c.SKILLS_ROUTES),
  },
  {
    path: "rating",
    loadChildren: () => import("./rating/rating.routes").then(c => c.RATING_ROUTES),
  },
  {
    path: "task",
    loadChildren: () => import("./task/task.routes").then(c => c.TASK_ROUTES),
  },
  {
    path: "trackBuss",
    loadChildren: () =>
      import("./trajectories/track-bussiness/track-bussiness.routes").then(
        c => c.TRACK_BUSSINESS_ROUTES
      ),
  },
  {
    path: "trackCar",
    loadChildren: () =>
      import("./trajectories/track-career/track-career.routes").then(c => c.TRACK_CAREER_ROUTES),
  },
  {
    path: "subscription",
    loadChildren: () =>
      import("./subscription/subscription.routes").then(c => c.SUBSCRIPTION_ROUTES),
  },
  {
    path: "webinars",
    loadChildren: () => import("./webinars/webinars.routes").then(c => c.WEBINARS_ROUTES),
  },
];
