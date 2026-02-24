/** @format */

import { Routes } from "@angular/router";

/**
 * Конфигурация маршрутов для модуля карьерных траекторий
 * Определяет структуру навигации:
 * - "" - редирект на "all"
 * - "all" - список всех доступных траекторий
 * - "my" - пользовательская траектория
 * - ":trackId" - детальная информация о конкретной траектории
 */

export const COURSES_ROUTES: Routes = [
  // {
  //   path: "",
  //   component: TrackCareerComponent,
  //   children: [
  //     {
  //       path: "",
  //       redirectTo: "all",
  //       pathMatch: "full",
  //     },
  //     {
  //       path: "all",
  //       component: TrajectoriesListComponent,
  //       resolve: {
  //         data: TrajectoriesResolver,
  //       },
  //     },
  //   ],
  // },
  // {
  //   path: ":trackId",
  //   loadChildren: () =>
  //     import("./detail/trajectory-detail.routes").then(c => c.TRAJECTORY_DETAIL_ROUTES),
  // },
];
