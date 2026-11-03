/** @format */

import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, provideRouter, RedirectCommand } from "@angular/router";
import { firstValueFrom, of } from "rxjs";
import { GetCourseDetailUseCase } from "@api/courses/use-cases/get-course-detail.use-case";
import { GetCourseStructureUseCase } from "@api/courses/use-cases/get-course-structure.use-case";
import { CoursesDetailResolver } from "./course-detail.resolver";

describe("CoursesDetailResolver", () => {
  const route = { parent: { params: { courseId: "6" } } } as unknown as ActivatedRouteSnapshot;
  const detail = { execute: vi.fn() };
  const structure = { execute: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: GetCourseDetailUseCase, useValue: detail },
        { provide: GetCourseStructureUseCase, useValue: structure },
        provideRouter([]),
      ],
    });
  });

  it.each([
    { ok: true, value: { isAvailable: false } },
    { ok: false, error: { kind: "unknown" } },
  ])("redirects unavailable and failed details with an explanation", async result => {
    detail.execute.mockReturnValue(of(result));
    const stream = TestBed.runInInjectionContext(() => CoursesDetailResolver(route));
    const redirect = await firstValueFrom(stream);
    expect(redirect).toBeInstanceOf(RedirectCommand);
    if (!(redirect instanceof RedirectCommand)) throw new Error("Expected a course redirect");
    expect(redirect.redirectTo.toString()).toBe("/office/courses/all");
    expect(redirect.navigationBehaviorOptions).toEqual({
      state: { courseUnavailable: true },
    });
    expect(structure.execute).not.toHaveBeenCalled();
  });

  it("loads an available course without an unavailable notice", async () => {
    const course = { isAvailable: true };
    detail.execute.mockReturnValue(of({ ok: true, value: course }));
    structure.execute.mockReturnValue(of({ ok: true, value: { lessons: [] } }));
    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() => CoursesDetailResolver(route)),
    );
    expect(result).not.toBeInstanceOf(RedirectCommand);
    if (result instanceof RedirectCommand) throw new Error("Expected an available course");
    expect(result[0]).toBe(course);
  });
});
