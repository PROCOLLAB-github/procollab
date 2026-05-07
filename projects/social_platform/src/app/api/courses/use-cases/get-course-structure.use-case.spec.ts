/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetCourseStructureUseCase } from "./get-course-structure.use-case";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { CourseStructure } from "@domain/courses/courses.model";

describe("GetCourseStructureUseCase", () => {
  let useCase: GetCourseStructureUseCase;
  let repo: jasmine.SpyObj<CoursesRepositoryPort>;

  function setup(): void {
    repo = jasmine.createSpyObj<CoursesRepositoryPort>("CoursesRepositoryPort", [
      "getCourseStructure",
    ]);
    TestBed.configureTestingModule({
      providers: [GetCourseStructureUseCase, { provide: CoursesRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetCourseStructureUseCase);
  }

  it("делегирует courseId в репозиторий", () => {
    setup();
    repo.getCourseStructure.and.returnValue(of({} as CourseStructure));

    useCase.execute(7).subscribe();

    expect(repo.getCourseStructure).toHaveBeenCalledOnceWith(7);
  });

  it("при успехе возвращает ok со структурой курса", done => {
    setup();
    const structure = { modules: [] } as unknown as CourseStructure;
    repo.getCourseStructure.and.returnValue(of(structure));

    useCase.execute(7).subscribe(result => {
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(structure);
      done();
    });
  });

  it("при ошибке возвращает fail { kind: 'get_course_structure_error' } с cause", done => {
    setup();
    const boom = new Error("boom");
    repo.getCourseStructure.and.returnValue(throwError(() => boom));

    useCase.execute(7).subscribe(result => {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.kind).toBe("get_course_structure_error");
        expect(result.error.cause).toBe(boom);
      }
      done();
    });
  });
});
