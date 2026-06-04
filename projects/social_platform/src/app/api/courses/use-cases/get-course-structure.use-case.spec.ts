/** @format */

import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { GetCourseStructureUseCase } from "./get-course-structure.use-case";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { CourseStructure } from "@domain/courses/courses.model";

describe("GetCourseStructureUseCase", () => {
  let useCase: GetCourseStructureUseCase;
  let repo: any;

  function setup(): void {
    repo = { getCourseStructure: vi.fn() };
    TestBed.configureTestingModule({
      providers: [GetCourseStructureUseCase, { provide: CoursesRepositoryPort, useValue: repo }],
    });
    useCase = TestBed.inject(GetCourseStructureUseCase);
  }

  it("делегирует courseId в репозиторий", () => {
    setup();
    repo.getCourseStructure.mockReturnValue(of({} as CourseStructure));

    useCase.execute(7).subscribe();

    expect(repo.getCourseStructure).toHaveBeenCalledExactlyOnceWith(7);
  });

  it("при успехе возвращает ok со структурой курса", () =>
    new Promise<void>(done => {
      setup();
      const structure = { modules: [] } as unknown as CourseStructure;
      repo.getCourseStructure.mockReturnValue(of(structure));

      useCase.execute(7).subscribe(result => {
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value).toBe(structure);
        done();
      });
    }));

  it("при ошибке возвращает fail { kind: 'get_course_structure_error' } с cause", () =>
    new Promise<void>(done => {
      setup();
      const boom = new Error("boom");
      repo.getCourseStructure.mockReturnValue(throwError(() => boom));

      useCase.execute(7).subscribe(result => {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe("get_course_structure_error");
          expect(result.error.cause).toBe(boom);
        }
        done();
      });
    }));
});
