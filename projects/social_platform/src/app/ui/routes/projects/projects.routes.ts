/** @format */

import { Routes } from "@angular/router";
import { ProjectsComponent } from "../../pages/projects/projects.component";
import { ProjectsResolver } from "../../pages/projects/projects.resolver";
import { ProjectsListComponent } from "../../pages/projects/list/list.component";
import { ProjectsMyResolver } from "../../pages/projects/list/my.resolver";
import { ProjectsAllResolver } from "../../pages/projects/list/all.resolver";
import { ProjectEditComponent } from "../../pages/projects/edit/edit.component";
import { ProjectEditResolver } from "../../pages/projects/edit/edit.resolver";
import { ProjectsSubscriptionsResolver } from "../../pages/projects/list/subscriptions.resolver";
import { ProjectEditRequiredGuard } from "../../../../../../core/src/lib/guards/projects-edit/projects-edit.guard";
import { ProjectsInvitesResolver } from "../../pages/projects/list/invites.resolver";
import { DashboardProjectsComponent } from "../../pages/projects/dashboard/dashboard.component";

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
      data: ProjectsInvitesResolver,
    },
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "dashboard",
      },
      {
        path: "dashboard",
        component: DashboardProjectsComponent,
        resolve: {
          data: ProjectsResolver,
        },
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
    loadChildren: () => import("./detail.routes").then(c => c.PROJECT_DETAIL_ROUTES),
  },
];
