/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { CourseDetail } from "@domain/courses/courses.model";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetCourseDetailUseCase {
  private readonly coursesRepository = inject(CoursesRepositoryPort);

  execute(
    courseId: number
  ): Observable<Result<CourseDetail, { kind: "get_course_detail_error"; cause?: unknown }>> {
    return this.coursesRepository.getCourseDetail(courseId).pipe(
      map(detail => ok<CourseDetail>(detail)),
      catchError(error => of(fail({ kind: "get_course_detail_error" as const, cause: error })))
    );
  }
}
