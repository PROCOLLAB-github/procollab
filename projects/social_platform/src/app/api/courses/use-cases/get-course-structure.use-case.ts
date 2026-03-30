/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { CourseStructure } from "@domain/courses/courses.model";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetCourseStructureUseCase {
  private readonly coursesRepository = inject(CoursesRepositoryPort);

  execute(
    courseId: number
  ): Observable<Result<CourseStructure, { kind: "get_course_structure_error"; cause?: unknown }>> {
    return this.coursesRepository.getCourseStructure(courseId).pipe(
      map(structure => ok<CourseStructure>(structure)),
      catchError(error => of(fail({ kind: "get_course_structure_error" as const, cause: error })))
    );
  }
}
