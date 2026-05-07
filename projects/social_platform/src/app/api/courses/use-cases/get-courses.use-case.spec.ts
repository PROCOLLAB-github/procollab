/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetCoursesUseCase } from "./get-courses.use-case";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { CourseCard } from "@domain/courses/courses.model";

describe("GetCoursesUseCase", () => {
  let useCase: GetCoursesUseCase;
  let repo: jasmine.SpyObj<CoursesRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<CoursesRepositoryPort>("CoursesRepositoryPort", ["getCourses"]);
    TestBed.configureTestingModule({
      providers: [GetCoursesUseCase, { provide: CoursesRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetCoursesUseCase);
  }

  it("вызывает getCourses у репозитория без параметров", () => {
    setup();
    repo.getCourses.and.returnValue(of([]));

    useCase.execute().subscribe();

    expect(repo.getCourses).toHaveBeenCalledOnceWith();
  });

  it("при успехе возвращает ok со списком курсов", done => {
    setup();
    const courses = [{ id: 1 }, { id: 2 }] as unknown as CourseCard[];
    repo.getCourses.and.returnValue(of(courses));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(courses);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_courses_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.getCourses.and.returnValue(throwError(() => boom));

    useCase.execute().subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("get_courses_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
