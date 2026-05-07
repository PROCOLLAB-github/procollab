/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetCourseLessonUseCase } from "./get-course-lesson.use-case";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { CourseLesson } from "@domain/courses/courses.model";

describe("GetCourseLessonUseCase", () => {
  let useCase: GetCourseLessonUseCase;
  let repo: jasmine.SpyObj<CoursesRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<CoursesRepositoryPort>("CoursesRepositoryPort", [
      "getCourseLesson",
    ]);
    TestBed.configureTestingModule({
      providers: [GetCourseLessonUseCase, { provide: CoursesRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetCourseLessonUseCase);
  }

  it("делегирует lessonId в репозиторий", () => {
    setup();
    repo.getCourseLesson.and.returnValue(of({} as CourseLesson));

    useCase.execute(7).subscribe();

    expect(repo.getCourseLesson).toHaveBeenCalledOnceWith(7);
  });

  it("при успехе возвращает ok с уроком", done => {
    setup();
    const lesson = { id: 7 } as CourseLesson;
    repo.getCourseLesson.and.returnValue(of(lesson));

    useCase.execute(7).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(lesson);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_course_lesson_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.getCourseLesson.and.returnValue(throwError(() => boom));

    useCase.execute(7).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("get_course_lesson_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
