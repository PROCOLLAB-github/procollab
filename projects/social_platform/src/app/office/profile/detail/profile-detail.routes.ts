/** @format */

import { Routes } from "@angular/router";
import { ProfileDetailResolver } from "./profile-detail.resolver";
import { ProfileMainComponent } from "./main/main.component";
import { ProfileProjectsComponent } from "./projects/projects.component";
import { ProfileMainResolver } from "./main/main.resolver";
import { ProfileNewsComponent } from "../profile-news/profile-news.component";
import { DeatilComponent } from "@office/features/detail/detail.component";

/**
 * Конфигурация маршрутов для детального просмотра профиля пользователя
 *
 * Определяет иерархическую структуру маршрутов:
 * - Корневой маршрут "" - основной компонент профиля с резолвером данных
 * - Дочерний маршрут "" - главная страница профиля (информация, навыки, новости)
 * - Дочерний маршрут "news/:newsId" - просмотр конкретной новости профиля
 * - Дочерний маршрут "projects" - список проектов пользователя
 *
 * Каждый маршрут использует соответствующие резолверы для предварительной загрузки данных,
 * что обеспечивает плавную навигацию без задержек загрузки.
 *
 * @type {Routes} - массив конфигураций маршрутов Angular
 */
export const PROFILE_DETAIL_ROUTES: Routes = [
  {
    path: "",
    component: DeatilComponent,
    resolve: {
      data: ProfileDetailResolver,
    },
    data: { listType: "profile" },
    children: [
      {
        path: "",
        component: ProfileMainComponent,
      },
      {
        path: "news/:newsId",
        component: ProfileNewsComponent,
        resolve: {
          data: ProfileMainResolver,
        },
      },
      {
        path: "projects",
        component: ProfileProjectsComponent,
      },
    ],
  },
];
