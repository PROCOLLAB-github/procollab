/** @format */
import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { ActivatedRoute, Router, convertToParamMap } from "@angular/router";
import { BehaviorSubject, of } from "rxjs";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { GetProjectRatingsUseCase } from "@api/program/use-cases/get-project-ratings.use-case";
import { FilterProjectRatingsUseCase } from "@api/program/use-cases/filter-project-ratings.use-case";
import { GetProgramFiltersUseCase } from "@api/program/use-cases/get-program-filters.use-case";
import { ExportFileInfoService } from "@api/export-file/facades/export-file-info.service";
import { RatingCardComponent } from "../detail/list/rating-card/rating-card.component";
import { fail, ok } from "@domain/shared/result.type";
import { RatingWorkspaceComponent } from "./rating-workspace.component";

describe("Program assessment workspace", () => {
  const get = vi.fn(),
    post = vi.fn(),
    navigate = vi.fn();
  let query: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let route: {
    snapshot: {
      paramMap: ReturnType<typeof convertToParamMap>;
      queryParamMap: ReturnType<typeof convertToParamMap>;
    };
    queryParamMap: typeof query;
  };
  beforeEach(async () => {
    get
      .mockReset()
      .mockReturnValue(
        of(ok({ count: 2, results: [{ id: 42 }], evaluationCounts: { pending: 2, completed: 7 } })),
      );
    post.mockReset().mockImplementation(get);
    navigate.mockReset().mockResolvedValue(true);
    query = new BehaviorSubject(convertToParamMap({}));
    route = {
      snapshot: { paramMap: convertToParamMap({}), queryParamMap: query.value },
      queryParamMap: query,
    };
    await TestBed.configureTestingModule({
      imports: [RatingWorkspaceComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        {
          provide: Router,
          useValue: {
            url: "/office/program/7/projects-rating",
            navigate,
            parseUrl: (url: string) => url,
          },
        },
        { provide: ProgramDetailMainUIInfoService, useValue: { program: signal({ id: 7 }) } },
        { provide: GetProjectRatingsUseCase, useValue: { execute: get } },
        { provide: FilterProjectRatingsUseCase, useValue: { execute: post } },
        { provide: GetProgramFiltersUseCase, useValue: { execute: () => of(ok([])) } },
      ],
    })
      .overrideComponent(RatingWorkspaceComponent, {
        set: {
          template: "",
          imports: [],
          providers: [{ provide: ExportFileInfoService, useValue: {} }],
        },
      })
      .compileComponents();
  });
  function create() {
    const fixture = TestBed.createComponent(RatingWorkspaceComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }
  it("uses own status and authoritative counts, independently of loaded rows", () => {
    const component = create();
    expect(get.mock.calls[0][0]).toBe(7);
    expect(get.mock.calls[0][1].get("evaluation_status")).toBe("pending");
    expect(get.mock.calls[0][1].has("is_rated_by_expert")).toBe(false);
    expect(component.counts()).toEqual({ pending: 2, completed: 7 });
    expect(component.rows()).toHaveLength(1);
    query.next(convertToParamMap({ status: "completed", q: "Город" }));
    const params = get.mock.calls.at(-1)![1];
    expect(params.get("evaluation_status")).toBe("completed");
    expect(params.get("name__contains")).toBe("Город");
  });
  it("preserves configured field filters through the existing POST contract", () => {
    query.next(convertToParamMap({ "filter.case": ["A", "B"] }));
    create();
    expect(post.mock.calls[0][1]).toEqual({ case: ["A", "B"] });
    expect(post.mock.calls[0][2].get("evaluation_status")).toBe("pending");
  });
  it("restores historical search, raw field filters and the legacy any-expert filter", () => {
    const params = convertToParamMap({
      name__contains: "Город",
      case: "A",
      is_rated_by_expert: "true",
    });
    route.snapshot.queryParamMap = params;
    query.next(params);
    TestBed.overrideProvider(GetProgramFiltersUseCase, {
      useValue: {
        execute: () =>
          of(ok([{ id: 1, name: "case", label: "Кейс", fieldType: "select", options: ["A"] }])),
      },
    });
    const component = create();
    expect(component.search.value).toBe("Город");
    expect(post.mock.calls.at(-1)![1]).toEqual({ case: ["A"] });
    expect(post.mock.calls.at(-1)![2].get("is_rated_by_expert")).toBe("true");
    component.navigate({ q: null });
    expect(navigate.mock.calls.at(-1)![1].queryParams).toEqual({ q: null, name__contains: null });
  });
  it("shows an explicit error if the API does not supply authoritative tab counts", () => {
    get.mockReturnValue(of(ok({ count: 1, results: [{ id: 42 }] })));
    const component = create();
    expect(component.rows()).toEqual([]);
    expect(component.failed()).toContain("данные об оценках");
  });
  it("does not expose a form on permission errors", () => {
    get.mockReturnValue(
      of(
        fail({ kind: "get_project_ratings_error", cause: new HttpErrorResponse({ status: 403 }) }),
      ),
    );
    route.snapshot.paramMap = convertToParamMap({ projectId: "42" });
    const component = create();
    expect(component.project()).toBeNull();
    expect(component.failed()).toContain("нет доступа");
  });
  it.each([
    "https://example.com",
    "//example.com",
    "/office/program/8/projects-rating",
    "/office/program/7/projects-rating?project_id=42",
  ])("rejects an unrelated return destination %s", url => {
    route.snapshot.queryParamMap = convertToParamMap({ returnUrl: url });
    expect(create().returnUrl).toBe("/office/program/7/projects-rating");
  });
  it("normalizes old cabinet links to the shared form route and preserves the source", () => {
    route.snapshot.queryParamMap = convertToParamMap({
      project_id: "42",
      returnUrl: "/office/evaluation?tab=completed&program=7",
    });
    create();
    expect(navigate).toHaveBeenCalledWith(["/office/program/7/projects-rating", 42], {
      queryParams: { returnUrl: "/office/evaluation?tab=completed&program=7" },
      replaceUrl: true,
    });
    expect(get).not.toHaveBeenCalled();
  });
  it("blocks leaving during submission and offers a centered-dialog decision for unsaved input", async () => {
    const component = create(),
      busy = signal(false),
      confirm = signal(true);
    vi.spyOn(component, "card").mockReturnValue({
      state: { submitLoading: busy, showConfirmRateModal: confirm },
      hasUnsavedChanges: () => true,
    } as unknown as RatingCardComponent);
    busy.set(true);
    expect(component.canLeave()).toBe(false);
    busy.set(false);
    const pending = component.canLeave();
    expect(component.leaveOpen()).toBe(true);
    expect(confirm()).toBe(false);
    component.answerLeave(false);
    expect(await pending).toBe(false);
    const leave = component.canLeave();
    component.answerLeave(true);
    expect(await leave).toBe(true);
  });
});
