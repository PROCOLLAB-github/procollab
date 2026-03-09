/** @format */

import { TrajectoryInfoComponent } from "./info/info.component";
import { CourseDetailComponent } from "./course-detail.component";
import { CoursesDetailResolver } from "./course-detail.resolver";

export const COURSE_DETAIL_ROUTES = [
  {
    path: "",
    component: CourseDetailComponent,
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
        loadChildren: () => import("../lesson/lesson.routes").then(m => m.LESSON_ROUTES),
      },
    ],
  },
];
