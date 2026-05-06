/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetCourseDetailUseCase } from "./get-course-detail.use-case";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { CourseDetail } from "@domain/courses/courses.model";

describe("GetCourseDetailUseCase", () => {
  let useCase: GetCourseDetailUseCase;
  let repo: jasmine.SpyObj<CoursesRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<CoursesRepositoryPort>("CoursesRepositoryPort", [
      "getCourseDetail",
    ]);
    TestBed.configureTestingModule({
      providers: [GetCourseDetailUseCase, { provide: CoursesRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetCourseDetailUseCase);
  }

  it("делегирует courseId в репозиторий", () => {
    setup();
    repo.getCourseDetail.and.returnValue(of({} as CourseDetail));

    useCase.execute(7).subscribe();

    expect(repo.getCourseDetail).toHaveBeenCalledOnceWith(7);
  });

  it("при успехе возвращает ok с деталями курса", done => {
    setup();
    const detail = { id: 7 } as CourseDetail;
    repo.getCourseDetail.and.returnValue(of(detail));

    useCase.execute(7).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(detail);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_course_detail_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.getCourseDetail.and.returnValue(throwError(() => boom));

    useCase.execute(7).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("get_course_detail_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
