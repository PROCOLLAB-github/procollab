/** @format */

import { Routes } from "@angular/router";
import { ProjectsComponent } from "./projects.component";
import { ProjectsResolver } from "./projects.resolver";
import { ProjectsListComponent } from "./list/list.component";
import { ProjectsMyResolver } from "./list/my.resolver";
import { ProjectsAllResolver } from "./list/all.resolver";
import { ProjectEditComponent } from "./edit/edit.component";
import { ProjectEditResolver } from "./edit/edit.resolver";
import { ProjectsSubscriptionsResolver } from "./list/subscriptions.resolver";
import { ProjectEditRequiredGuard } from "./edit/guards/projects-edit.guard";
import { ProjectsInvitesResolver } from "./list/invites.resolver";

/**
 * Конфигурация маршрутов для модуля проектов
 *
 * Определяет структуру навигации:
 *
 * Основные маршруты:
 * - '' (root) - ProjectsComponent с дочерними маршрутами:
 *   - 'my' - список собственных проектов
 *   - 'subscriptions' - список проектов по подписке
 *   - 'all' - список всех проектов
 * - ':projectId/edit' - редактирование проекта
 * - ':projectId' - детальная информация о проекте (lazy loading)
 *
 * Каждый маршрут имеет свой resolver для предварительной загрузки данных:
 * - ProjectsResolver - загружает счетчики проектов
 * - ProjectsMyResolver - загружает собственные проекты
 * - ProjectsAllResolver - загружает все проекты
 * - ProjectsSubscriptionsResolver - загружает проекты по подписке
 * - ProjectEditResolver - загружает данные для редактирования
 *
 * Использует lazy loading для детальной информации о проекте
 * для оптимизации загрузки приложения.
 */
export const PROJECTS_ROUTES: Routes = [
  {
    path: "",
    component: ProjectsComponent,
    resolve: {
      data: ProjectsResolver,
    },
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "my",
      },
      {
        path: "my",
        component: ProjectsListComponent,
        resolve: {
          data: ProjectsMyResolver,
        },
      },
      {
        path: "subscriptions",
        component: ProjectsListComponent,
        resolve: {
          data: ProjectsSubscriptionsResolver,
        },
      },
      {
        path: "invites",
        component: ProjectsListComponent,
        resolve: {
          data: ProjectsInvitesResolver,
        },
      },
      {
        path: "all",
        component: ProjectsListComponent,
        resolve: {
          data: ProjectsAllResolver,
        },
      },
    ],
  },
  {
    path: ":projectId/edit",
    component: ProjectEditComponent,
    resolve: {
      data: ProjectEditResolver,
    },
    canActivate: [ProjectEditRequiredGuard],
  },
  {
    path: ":projectId",
    loadChildren: () => import("./detail/detail.routes").then(c => c.PROJECT_DETAIL_ROUTES),
  },
];
