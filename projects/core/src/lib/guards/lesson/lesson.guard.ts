/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { catchError, map, Observable, of } from "rxjs";

export const LessonGuard = (route: ActivatedRouteSnapshot): Observable<boolean> => {
  const coursesRepository = inject(CoursesRepositoryPort);
  const router = inject(Router);

  const courseId = route.parent?.paramMap.get("courseId");
  const lessonId = Number(route.firstChild?.paramMap.get("lessonId"));

  const redirect = (): boolean => {
    router.navigateByUrl(`/office/courses/${courseId ?? ""}`);
    return false;
  };

  if (isNaN(lessonId) || !courseId) {
    return of(redirect());
  }

  return coursesRepository.getCourseLesson(lessonId).pipe(
    map(lesson => {
      if (lesson.progressStatus === "blocked") {
        return redirect();
      }
      return true;
    }),
    catchError(() => of(redirect())),
  );
};
