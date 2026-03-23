/** @format */

import type { Routes } from "@angular/router";
import { TrajectoryInfoComponent } from "../../pages/courses/detail/info/info.component";
import { CourseDetailComponent } from "../../pages/courses/detail/course-detail.component";
import { CoursesDetailResolver } from "../../pages/courses/detail/course-detail.resolver";

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
        component: TrajectoryInfoComponent,
      },
      {
        path: "lesson",
        loadChildren: () => import("./lesson.routes").then(m => m.LESSON_ROUTES),
      },
    ],
  },
];
