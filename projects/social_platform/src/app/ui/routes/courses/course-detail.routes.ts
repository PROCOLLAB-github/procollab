/** @format */

import type { Routes } from "@angular/router";
import { CourseDetailComponent } from "@ui/pages/courses/detail/course-detail.component";
import { CoursesDetailResolver } from "@ui/pages/courses/detail/course-detail.resolver";
import { CourseInfoComponent } from "@ui/pages/courses/detail/info/info.component";

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
        loadChildren: () => import("./lesson.routes").then(m => m.LESSON_ROUTES),
      },
    ],
  },
];
