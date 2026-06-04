/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetCourseLessonUseCase } from "./get-course-lesson.use-case";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { CourseLesson } from "@domain/courses/courses.model";

describe("GetCourseLessonUseCase", () => {
  let useCase: GetCourseLessonUseCase;
  let repo: any;

  function setup(): void {
    repo = { getCourseLesson: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetCourseLessonUseCase, { provide: CoursesRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetCourseLessonUseCase);
  }

  it("делегирует lessonId в репозиторий", () => {
    setup();
    repo.getCourseLesson.mockReturnValue(of({} as CourseLesson));

    useCase.execute(7).subscribe();

    expect(repo.getCourseLesson).toHaveBeenCalledExactlyOnceWith(7);
  });

  it("при успехе возвращает ok с уроком", () =>
    new Promise<void>(done => {
      setup();
      const lesson = { id: 7 } as CourseLesson;
      repo.getCourseLesson.mockReturnValue(of(lesson));

      useCase.execute(7).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(lesson);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_course_lesson_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.getCourseLesson.mockReturnValue(throwError(() => boom));

      useCase.execute(7).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_course_lesson_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
