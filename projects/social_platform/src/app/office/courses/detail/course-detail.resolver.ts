/** @format */

import { inject } from "@angular/core";
import type { ActivatedRouteSnapshot } from "@angular/router";
import { Router } from "@angular/router";
import { CoursesService } from "../courses.service";
import { forkJoin, tap } from "rxjs";

/**
 * Резолвер для получения детальной информации о курсе
 * Также проверяет isAvailable — если false, редиректит на список курсов
 * @param route - снимок маршрута содержащий параметр courseId
 * @returns Observable с данными о курсе
 */
export const CoursesDetailResolver = (route: ActivatedRouteSnapshot) => {
  const coursesService = inject(CoursesService);
  const router = inject(Router);
  const courseId = route.parent?.params["courseId"];

  return forkJoin([
    coursesService.getCourseDetail(courseId).pipe(
      tap(course => {
        if (!course.isAvailable) {
          router.navigate(["/office/courses/all"]);
        }
      })
    ),
    coursesService.getCourseStructure(courseId),
  ]);
};
