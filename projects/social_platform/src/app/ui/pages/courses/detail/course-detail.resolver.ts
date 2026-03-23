/** @format */

import { inject } from "@angular/core";
import type { ActivatedRouteSnapshot } from "@angular/router";
import { Router } from "@angular/router";
import { EMPTY, map, switchMap } from "rxjs";
import { GetCourseDetailUseCase } from "@api/courses/use-cases/get-course-detail.use-case";
import { GetCourseStructureUseCase } from "@api/courses/use-cases/get-course-structure.use-case";

export const CoursesDetailResolver = (route: ActivatedRouteSnapshot) => {
  const getCourseDetailUseCase = inject(GetCourseDetailUseCase);
  const getCourseStructureUseCase = inject(GetCourseStructureUseCase);
  const router = inject(Router);
  const courseId = route.parent?.params["courseId"];

  return getCourseDetailUseCase.execute(courseId).pipe(
    switchMap(detailResult => {
      const detail = detailResult.ok ? detailResult.value : null;

      if (!detail?.isAvailable) {
        router.navigate(["/office/courses/all"]);
        return EMPTY;
      }

      return getCourseStructureUseCase
        .execute(courseId)
        .pipe(map(structureResult => [detail, structureResult.ok ? structureResult.value : null]));
    })
  );
};
