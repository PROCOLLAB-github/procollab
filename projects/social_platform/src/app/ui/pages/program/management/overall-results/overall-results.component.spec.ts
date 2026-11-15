/** @format */

import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { Router, provideRouter } from "@angular/router";
import { Observable, Subject, of, throwError } from "rxjs";
import { saveAs } from "file-saver";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import { ProgramOverallResults } from "@domain/program/program-overall-results.model";
import { ResultsQuery } from "@domain/program/program-results.model";
import { ManagementOverallResultsComponent } from "./overall-results.component";

vi.mock("file-saver", () => ({ saveAs: vi.fn() }));

const snapshot: ProgramOverallResults = {
  programId: 42,
  programName: "Чемпионат",
  generatedAt: "2026-11-12T12:30:00Z",
  formula: "case_plus_quiz",
  caseMaximum: 100,
  quizMaximum: 100,
  maximum: 200,
  caseScoringMode: "weighted_percent",
  caseScoringConfigured: true,
  caseOptions: ["Право"],
  totalCount: 2,
  totalReadyCount: 1,
  matchingCount: 2,
  readyCount: 1,
  projects: [
    {
      id: 15,
      projectId: 91,
      name: "Настоящий ноль",
      caseName: "Право",
      submitted: true,
      caseScore: 0,
      caseComplete: true,
      caseStatus: "complete",
      caseEvaluatorsCompleted: 2,
      caseEvaluatorsRequired: 2,
      quizScore: 0,
      quizComplete: true,
      score: 0,
      ready: true,
      status: "complete",
      place: 8,
    },
    {
      id: 16,
      projectId: 92,
      name: "Ожидающая команда",
      caseName: null,
      submitted: true,
      caseScore: 80,
      caseComplete: false,
      caseStatus: "pending",
      caseEvaluatorsCompleted: 1,
      caseEvaluatorsRequired: 2,
      quizScore: 70,
      quizComplete: true,
      score: null,
      ready: false,
      status: "pending_case",
      place: null,
    },
  ],
};

async function setup(
  options: { query?: string; response?: Subject<ProgramOverallResults>; error?: number } = {},
) {
  const api = {
    overallResults: vi.fn<(id: number, query: ResultsQuery) => Observable<ProgramOverallResults>>(
      () =>
        options.error
          ? throwError(() => new HttpErrorResponse({ status: options.error }))
          : (options.response ?? of(structuredClone(snapshot))),
    ),
    exportOverallResults: vi.fn<(id: number, query: ResultsQuery) => Observable<Blob>>(
      () => new Subject<Blob>(),
    ),
  };
  TestBed.configureTestingModule({
    imports: [ManagementOverallResultsComponent],
    providers: [provideRouter([]), { provide: ProgramManagementUseCase, useValue: api }],
  });
  const router = TestBed.inject(Router);
  if (options.query) await router.navigateByUrl("/?" + options.query);
  const fixture = TestBed.createComponent(ManagementOverallResultsComponent);
  fixture.componentRef.setInput("programId", 42);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, api, router };
}

describe("Общий рейтинг кейса и квиза", () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });
  afterEach(() => TestBed.resetTestingModule());

  it("показывает серверное место, настоящий ноль и ссылку по projectId", async () => {
    const { fixture } = await setup();
    const row = fixture.nativeElement.querySelector("tbody tr");
    expect(row.querySelector(".overall__place").textContent.trim()).toBe("8");
    const metrics = row.querySelectorAll(".overall__metric");
    expect(metrics).toHaveLength(3);
    for (const metric of metrics) expect(metric.textContent).toContain("0,00");
    expect(row.querySelector("a").getAttribute("href")).toContain("/projects/91");
    expect(fixture.nativeElement.textContent).toContain("Обновлено 15:30");
  });

  it("не подменяет ожидание нулем и показывает незавершенную экспертную оценку", async () => {
    const { fixture } = await setup();
    const row = fixture.nativeElement.querySelectorAll("tbody tr")[1];
    expect(row.querySelector(".overall__place").textContent.trim()).toBe("");
    expect(row.querySelector(".overall__total").textContent).toContain("Ожидает");
    expect(row.querySelector(".overall__status").textContent).toContain("1 из 2 оценок кейса");
    expect(row.querySelector(".overall__case").textContent).toContain("Без кейса");
  });

  it("восстанавливает фильтры из ссылки и использует ту же выборку для Excel", async () => {
    const { component, api } = await setup({ query: "search=Ноль&status=pending" });
    expect(component.search.value).toBe("Ноль");
    expect(component.statusFilter.value).toBe("pending");
    expect(api.overallResults).toHaveBeenLastCalledWith(
      42,
      expect.objectContaining({ search: "Ноль", status: "pending" }),
    );
    component.download();
    expect(api.exportOverallResults).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ search: "Ноль", status: "pending", scope: "current" }),
    );
  });

  it("сохраняет поиск после debounce в URL и не пересчитывает место", async () => {
    const { fixture, component, router, api } = await setup();
    component.search.setValue("Ноль");
    expect(api.overallResults).toHaveBeenCalledTimes(1);
    component.download();
    expect(api.exportOverallResults).not.toHaveBeenCalled();
    await new Promise(resolve => setTimeout(resolve, 350));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.parseUrl(router.url).queryParams["search"]).toBe("Ноль");
    expect(api.overallResults).toHaveBeenLastCalledWith(
      42,
      expect.objectContaining({ search: "Ноль" }),
    );
    expect(component.snapshot()?.projects[0].place).toBe(8);
  });

  it("отменяет устаревший запрос и оставляет loading до нового ответа", async () => {
    const first = new Subject<ProgramOverallResults>(),
      second = new Subject<ProgramOverallResults>();
    const { fixture, component, api, router } = await setup({ response: first });
    api.overallResults.mockReturnValue(second);
    await router.navigateByUrl("/?status=pending");
    fixture.detectChanges();
    expect(first.observed).toBe(false);
    expect(component.loading()).toBe(true);
    first.next(snapshot);
    expect(component.snapshot()).toBeNull();
    second.next({ ...snapshot, readyCount: 0, matchingCount: 1, projects: [snapshot.projects[1]] });
    second.complete();
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
    expect(component.snapshot()?.projects.map(row => row.name)).toEqual(["Ожидающая команда"]);
  });

  it("при смене программы очищает строки и отменяет выгрузку прежней программы", async () => {
    const { fixture, component, api } = await setup();
    const exportRequest = new Subject<Blob>(),
      next = new Subject<ProgramOverallResults>();
    api.exportOverallResults.mockReturnValue(exportRequest);
    component.download();
    api.overallResults.mockReturnValue(next);
    fixture.componentRef.setInput("programId", 43);
    fixture.detectChanges();
    expect(component.snapshot()).toBeNull();
    expect(exportRequest.observed).toBe(false);
    exportRequest.next(new Blob(["old"]));
    expect(saveAs).not.toHaveBeenCalled();
    expect(component.exporting()).toBe(false);
    expect(api.overallResults).toHaveBeenLastCalledWith(43, expect.anything());
  });

  it("показывает ошибку выгрузки и позволяет повторить без изменения рейтинга", async () => {
    const { component, api } = await setup();
    api.exportOverallResults.mockImplementationOnce(() => throwError(() => new Error("offline")));
    component.download();
    expect(component.exportError()).toBe(true);
    component.download();
    expect(component.exportError()).toBe(false);
    expect(component.exporting()).toBe(true);
    expect(component.snapshot()?.projects[0].score).toBe(0);
  });

  it.each([401, 403, 404, 409])(
    "обрабатывает HTTP %i без старых строк и выгрузки",
    async status => {
      const { fixture, component, api } = await setup({ error: status });
      expect(component.error()?.status).toBe(status);
      expect(fixture.nativeElement.querySelector("tbody")).toBeNull();
      expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
      component.download();
      expect(api.exportOverallResults).not.toHaveBeenCalled();
    },
  );

  it("отличает пустую программу от пустой выборки и предлагает сброс фильтров", async () => {
    const { component, fixture } = await setup({ query: "search=Нет" });
    component.snapshot.set({ ...snapshot, matchingCount: 0, readyCount: 0, projects: [] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Команды не найдены");
    expect(fixture.nativeElement.textContent).toContain("Сбросить фильтры");
    component.snapshot.set({
      ...snapshot,
      totalCount: 0,
      matchingCount: 0,
      readyCount: 0,
      projects: [],
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Команды пока не добавлены");
  });

  it("для legacy предлагает настроить критерии и не выгружает фиктивный итог", async () => {
    const { component, fixture, api } = await setup();
    component.snapshot.set({
      ...snapshot,
      caseScoringConfigured: false,
      caseScoringMode: "legacy",
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Настройте оценку кейса из 100");
    expect(fixture.nativeElement.querySelector("table")).toBeNull();
    expect(fixture.nativeElement.querySelector('a[href*="tab=criteria"]')).not.toBeNull();
    component.download();
    expect(api.exportOverallResults).not.toHaveBeenCalled();
  });
});
