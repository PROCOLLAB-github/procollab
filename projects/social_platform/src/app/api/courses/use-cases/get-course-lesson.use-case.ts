/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { CourseLesson } from "@domain/courses/courses.model";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetCourseLessonUseCase {
  private readonly coursesRepository = inject(CoursesRepositoryPort);

  execute(
    lessonId: number
  ): Observable<Result<CourseLesson, { kind: "get_course_lesson_error"; cause?: unknown }>> {
    return this.coursesRepository.getCourseLesson(lessonId).pipe(
      map(lesson => ok<CourseLesson>(lesson)),
      catchError(error => of(fail({ kind: "get_course_lesson_error" as const, cause: error })))
    );
  }
}
