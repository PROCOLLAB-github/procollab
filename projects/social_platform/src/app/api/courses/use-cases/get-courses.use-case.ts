/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { CourseCard } from "@domain/courses/courses.model";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetCoursesUseCase {
  private readonly coursesRepository = inject(CoursesRepositoryPort);

  execute(): Observable<Result<CourseCard[], { kind: "get_courses_error"; cause?: unknown }>> {
    return this.coursesRepository.getCourses().pipe(
      map(courses => ok<CourseCard[]>(courses)),
      catchError(error => of(fail({ kind: "get_courses_error" as const, cause: error })))
    );
  }
}
