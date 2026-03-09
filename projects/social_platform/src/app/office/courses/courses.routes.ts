/** @format */

import { Routes } from "@angular/router";
import { CoursesListComponent } from "./list/list.component";
import { CoursesComponent } from "./courses.component";
import { CoursesResolver } from "./courses.resolver";

/**
 * Конфигурация маршрутов для модуля карьерных траекторий
 * Определяет структуру навигации:
 * - "" - редирект на "all"
 * - "all" - список всех доступных траекторий
 * - ":courseId" - детальная информация о конкретном курсе
 */

export const COURSES_ROUTES: Routes = [
  {
    path: "",
    component: CoursesComponent,
    children: [
      {
        path: "",
        redirectTo: "all",
        pathMatch: "full",
      },
      {
        path: "all",
        component: CoursesListComponent,
        resolve: {
          data: CoursesResolver,
        },
      },
    ],
  },
  {
    path: ":courseId",
    loadChildren: () => import("./detail/course-detail.routes").then(c => c.COURSE_DETAIL_ROUTES),
  },
];
