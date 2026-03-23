/** @format */

import { inject } from "@angular/core";
import type { ActivatedRouteSnapshot } from "@angular/router";
import { Router } from "@angular/router";
import { forkJoin, tap } from "rxjs";
import { CoursesHttpAdapter } from "@infrastructure/adapters/courses/courses-http.adapter";

/**
 * Резолвер для получения детальной информации о курсе
 * Также проверяет isAvailable — если false, редиректит на список курсов
 * @param route - снимок маршрута содержащий параметр courseId
 * @returns Observable с данными о курсе
 */
export const CoursesDetailResolver = (route: ActivatedRouteSnapshot) => {
  const coursesAdapter = inject(CoursesHttpAdapter);
  const router = inject(Router);
  const courseId = route.parent?.params["courseId"];

  return forkJoin([
    coursesAdapter.getCourseDetail(courseId).pipe(
      tap(course => {
        if (!course.isAvailable) {
          router.navigate(["/office/courses/all"]);
        }
      })
    ),
    coursesAdapter.getCourseStructure(courseId),
  ]);
};
