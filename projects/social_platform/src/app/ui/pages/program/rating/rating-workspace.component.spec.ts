/** @format */
import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from "@angular/router";
import { BehaviorSubject, of, Subject } from "rxjs";
import { GetProgramUseCase } from "@api/program/use-cases/get-program.use-case";
import { GetProjectRatingsUseCase } from "@api/program/use-cases/get-project-ratings.use-case";
import { Program } from "@domain/program/program.model";
import { fail, ok } from "@domain/shared/result.type";
import { RatingWorkspaceComponent } from "./rating-workspace.component";

describe("Оценка проекта в кабинете", () => {
  const getProgram = vi.fn<GetProgramUseCase["execute"]>();
  const getRatings = vi.fn<GetProjectRatingsUseCase["execute"]>();
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let query: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ programId: 7, projectId: 42 }));
    query = new BehaviorSubject(
      convertToParamMap({ returnUrl: "/office/evaluation?tab=completed&program=7" }),
    );
    getProgram.mockReset().mockImplementation(id => of(ok({ ...Program.default(), id })));
    getRatings.mockReset();
    TestBed.configureTestingModule({
      imports: [RatingWorkspaceComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: params.value, queryParamMap: query.value },
            paramMap: params,
            queryParamMap: query,
          },
        },
        { provide: GetProgramUseCase, useValue: { execute: getProgram } },
        { provide: GetProjectRatingsUseCase, useValue: { execute: getRatings } },
      ],
    }).overrideComponent(RatingWorkspaceComponent, { set: { template: "", imports: [] } });
  });

  it("загружает новую работу и отменяет старый запрос при смене параметров маршрута", () => {
    const first = new Subject<ReturnType<typeof ok<never>>>();
    getRatings.mockReturnValueOnce(first).mockReturnValue(
      of(
        ok({
          count: 1,
          results: [{ id: 51 }] as never[],
          next: "",
          previous: "",
        }),
      ),
    );
    const fixture = TestBed.createComponent(RatingWorkspaceComponent);
    fixture.detectChanges();
    expect(first.observed).toBe(true);

    params.next(convertToParamMap({ programId: 9, projectId: 51 }));
    expect(first.observed).toBe(false);
    expect(getProgram).toHaveBeenLastCalledWith(9);
    expect(getRatings.mock.lastCall?.[1]?.get("project_id")).toBe("51");
    expect(fixture.componentInstance.project()?.id).toBe(51);
  });

  it("сохраняет вкладку кабинета при возврате и отклоняет внешний адрес", () => {
    getRatings.mockReturnValue(of(ok({ count: 0, results: [], next: "", previous: "" })));
    const component = TestBed.createComponent(RatingWorkspaceComponent).componentInstance;
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(component.returnTree())).toBe(
      "/office/evaluation?tab=completed&program=7",
    );
    query.next(convertToParamMap({ returnUrl: "https://example.test" }));
    expect(router.serializeUrl(component.returnTree())).toBe("/office/evaluation?program=7");
  });

  it("показывает ошибку доступа и не открывает форму", () => {
    getRatings.mockReturnValue(
      of(
        fail({
          kind: "get_project_ratings_error",
          cause: new HttpErrorResponse({ status: 403 }),
        }),
      ),
    );
    const component = TestBed.createComponent(RatingWorkspaceComponent).componentInstance;
    expect(component.failed()).toContain("нет доступа");
    expect(component.project()).toBeNull();
  });
});
