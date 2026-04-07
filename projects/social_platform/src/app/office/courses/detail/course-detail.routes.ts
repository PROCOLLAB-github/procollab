/** @format */

import type { Routes } from "@angular/router";
import { CourseDetailComponent } from "./course-detail.component";
import { CoursesDetailResolver } from "./course-detail.resolver";
import { CourseInfoComponent } from "./info/info.component";

export const COURSE_DETAIL_ROUTES: Routes = [
  {
    path: "",
    component: CourseDetailComponent,
    runGuardsAndResolvers: "always",
    resolve: {
      data: CoursesDetailResolver,
    },
    children: [
      {
        path: "",
        component: CourseInfoComponent,
      },
      {
        path: "lesson",
        loadChildren: () => import("../lesson/lesson.routes").then(m => m.LESSON_ROUTES),
      },
    ],
  },
];
