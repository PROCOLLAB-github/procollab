/** @format */

import { Routes } from "@angular/router";
import { OfficeComponent } from "./office.component";
import { ProfileEditComponent } from "./profile/edit/edit.component";
import { MembersComponent } from "./members/members.component";
import { MembersResolver } from "./members/members.resolver";
import { OfficeResolver } from "./office.resolver";

/**
 * Конфигурация маршрутов для модуля офиса
 * Определяет все доступные пути и их компоненты в рабочем пространстве
 *
 * Принимает:
 * - URL пути от роутера Angular
 *
 * Возвращает:
 * - Конфигурацию маршрутов с ленивой загрузкой модулей
 * - Резолверы для предзагрузки данных
 */
export const OFFICE_ROUTES: Routes = [
  {
    path: "onboarding",
    loadChildren: () => import("./onboarding/onboarding.routes").then(c => c.ONBOARDING_ROUTES),
  },
  {
    path: "",
    component: OfficeComponent,
    resolve: {
      invites: OfficeResolver,
    },
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "program",
      },
      {
        path: "feed",
        loadChildren: () => import("./feed/feed.routes").then(c => c.FEED_ROUTES),
      },
      {
        path: "vacancies",
        loadChildren: () => import("./vacancies/vacancies.routes").then(c => c.VACANCIES_ROUTES),
      },
      {
        path: "projects",
        loadChildren: () => import("./projects/projects.routes").then(c => c.PROJECTS_ROUTES),
      },
      {
        path: "program",
        loadChildren: () => import("./program/program.routes").then(c => c.PROGRAM_ROUTES),
      },
      {
        path: "chats",
        loadChildren: () => import("./chat/chat.routes").then(c => c.CHAT_ROUTES),
      },
      {
        path: "members",
        component: MembersComponent,
        resolve: {
          data: MembersResolver,
        },
      },
      {
        path: "profile/edit",
        component: ProfileEditComponent,
      },
      {
        path: "profile/:id",
        loadChildren: () =>
          import("./profile/detail/profile-detail.routes").then(c => c.PROFILE_DETAIL_ROUTES),
      },
      {
        path: "**",
        redirectTo: "/error/404",
      },
    ],
  },
];
