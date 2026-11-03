/** @format */

import { inject } from "@angular/core";
import type { ActivatedRouteSnapshot } from "@angular/router";
import { RedirectCommand, Router } from "@angular/router";
import { map, of, switchMap } from "rxjs";
import { GetCourseDetailUseCase } from "@api/courses/use-cases/get-course-detail.use-case";
import { GetCourseStructureUseCase } from "@api/courses/use-cases/get-course-structure.use-case";
import { AppRoutes } from "@api/paths/app-routes";

/** Резолвер: загружает детали курса и его структуру; редиректит на список, если курс недоступен. */
export const CoursesDetailResolver = (route: ActivatedRouteSnapshot) => {
  const getCourseDetailUseCase = inject(GetCourseDetailUseCase);
  const getCourseStructureUseCase = inject(GetCourseStructureUseCase);
  const router = inject(Router);
  const courseId = route.parent?.params["courseId"];

  return getCourseDetailUseCase.execute(courseId).pipe(
    switchMap(detailResult => {
      const detail = detailResult.ok ? detailResult.value : null;

      if (!detail?.isAvailable) {
        return of(
          new RedirectCommand(router.parseUrl(AppRoutes.courses.list()), {
            state: { courseUnavailable: true },
          }),
        );
      }

      return getCourseStructureUseCase
        .execute(courseId)
        .pipe(map(structureResult => [detail, structureResult.ok ? structureResult.value : null]));
    }),
  );
};
