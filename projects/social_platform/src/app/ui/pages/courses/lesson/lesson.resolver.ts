/** @format */

import type { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { CourseLesson } from "@domain/courses/courses.model";
import { GetCourseLessonUseCase } from "@api/courses/use-cases/get-course-lesson.use-case";
import { map } from "rxjs";

export const lessonDetailResolver: ResolveFn<CourseLesson | null> = (route, _state) => {
  const getCourseLessonUseCase = inject(GetCourseLessonUseCase);
  const lessonId = route.params["lessonId"];

  return getCourseLessonUseCase
    .execute(lessonId)
    .pipe(map(result => (result.ok ? result.value : null)));
};
