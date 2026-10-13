/** @format */
import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { GetProgramCaseProjectsUseCase } from "@api/program/use-cases/get-program-case-projects.use-case";
import { ExportProgramCaseProjectsUseCase } from "@api/program/use-cases/export-program-case-projects.use-case";
import {
  casePage,
  caseMetrics,
  selectedCase,
  caseProject,
} from "@domain/program/program-case-analytics.fixture";
import { fail, ok } from "@domain/shared/result.type";
import { saveCaseProjects } from "@utils/program-case-analytics";
import { ProgramCaseProjectsService } from "./program-case-projects.service";

vi.mock("@utils/program-case-analytics", () => ({ saveCaseProjects: vi.fn() }));

describe("Case drilldown: контекст, фильтры, страницы и export найденных", () => {
  const get = { execute: vi.fn() };
  const download = { execute: vi.fn() };
  let service: ProgramCaseProjectsService;
  beforeEach(() => {
    get.execute.mockReset().mockReturnValue(of(ok(casePage())));
    download.execute.mockReset().mockReturnValue(of(ok(new Blob(["xlsx"]))));
    vi.mocked(saveCaseProjects).mockReset();
    TestBed.configureTestingModule({
      providers: [
        ProgramCaseProjectsService,
        { provide: GetProgramCaseProjectsUseCase, useValue: get },
        { provide: ExportProgramCaseProjectsUseCase, useValue: download },
      ],
    });
    service = TestBed.inject(ProgramCaseProjectsService);
  });
  it("до подтверждения contract export заблокирован; overview-метрики видны при loading", () => {
    const pending = new Subject<any>();
    get.execute.mockReturnValue(pending);
    service.open(12, selectedCase, caseMetrics, true);
    expect(service.pending()).toBe(true);
    expect(service.metrics()).toEqual(caseMetrics);
    service.download();
    expect(download.execute).not.toHaveBeenCalled();
    pending.next(ok(casePage()));
    expect(service.canExport()).toBe(true);
  });
  it("search сбрасывает страницу, сохраняет метрики кейса и запрещает пустую выгрузку", () => {
    service.open(12, selectedCase);
    service.offset.set(25);
    service.searchDraft.set("  неизвестный проект  ");
    get.execute.mockReturnValue(of(ok(casePage({ count: 0, results: [] }))));
    service.applySearch();
    expect(get.execute).toHaveBeenLastCalledWith(12, {
      selection: selectedCase,
      search: "неизвестный проект",
      submission: "all",
      presentation: "all",
      limit: 25,
      offset: 0,
    });
    expect(service.page()?.count).toBe(0);
    expect(service.metrics()).toEqual(caseMetrics);
    expect(service.canExport()).toBe(false);
    service.download();
    expect(download.execute).not.toHaveBeenCalled();
    service.clearSearch();
    expect(get.execute.mock.lastCall?.[1].search).toBe("");
  });
  it("pagination не следует URL next и использует стабильный offset", () => {
    get.execute.mockReturnValue(
      of(
        ok(
          casePage({
            count: 26,
            next: "https://foreign.invalid",
            results: Array.from({ length: 25 }, (_, i) => caseProject({ programProjectId: i + 1 })),
          }),
        ),
      ),
    );
    service.open(12, selectedCase);
    expect(service.range()).toBe("1–25 из 26");
    get.execute.mockReturnValue(of(ok(casePage({ count: 26, results: [caseProject()] }))));
    service.changePage(1);
    expect(get.execute.mock.lastCall?.[1].offset).toBe(25);
    expect(service.range()).toBe("26–26 из 26");
    expect(service.hasNext()).toBe(false);
    service.changePage(1);
    expect(get.execute).toHaveBeenCalledTimes(2);
    service.changePage(-1);
    expect(get.execute.mock.lastCall?.[1].offset).toBe(0);
  });
  it("zero configured case не включает export", () => {
    get.execute.mockReturnValue(
      of(
        ok(
          casePage({
            count: 0,
            results: [],
            caseMetrics: { projectsTotal: 0, participantsTotal: 0, submitted: 0, notSubmitted: 0 },
          }),
        ),
      ),
    );
    service.open(12, selectedCase);
    expect(service.canExport()).toBe(false);
    expect(service.page()?.results).toEqual([]);
  });
  it.each(["case", "program", "close", "destroy"] as const)(
    "отменяет list и XLSX при %s",
    change => {
      service.open(12, selectedCase);
      const staleList = new Subject<any>();
      const freshList = new Subject<any>();
      const staleFile = new Subject<any>();
      get.execute.mockReturnValue(staleList);
      download.execute.mockReturnValue(staleFile);
      service.download();
      service.load();
      get.execute.mockReturnValue(freshList);
      if (change === "case") service.open(12, { scope: "without_case" });
      if (change === "program") service.open(99, selectedCase);
      if (change === "close") service.reset();
      if (change === "destroy") TestBed.resetTestingModule();
      expect(staleList.observed).toBe(false);
      staleList.next(ok(casePage()));
      expect(service.page()).toBeNull();
      expect(staleFile.observed).toBe(false);
      staleFile.next(ok(new Blob(["stale"])));
      expect(saveCaseProjects).not.toHaveBeenCalled();
      if (change === "close" || change === "destroy") {
        expect(staleList.observed).toBe(false);
        staleList.next(ok(casePage()));
        expect(service.page()).toBeNull();
      }
      if (change === "case" || change === "program") {
        const fresh = casePage({ count: 0, results: [] });
        freshList.next(ok(fresh));
        expect(service.page()).toEqual(fresh);
      }
    },
  );
  it("поиск отменяет предыдущий list и файл с устаревшим отбором", () => {
    const first = new Subject<any>(),
      next = new Subject<any>(),
      file = new Subject<any>();
    service.open(12, selectedCase);
    download.execute.mockReturnValue(file);
    service.download();
    service.download();
    expect(download.execute).toHaveBeenCalledTimes(1);
    get.execute.mockReturnValueOnce(first).mockReturnValueOnce(next);
    service.load();
    service.searchDraft.set("Новый");
    service.applySearch();
    expect(first.observed).toBe(false);
    expect(file.observed).toBe(false);
    file.next(ok(new Blob(["xlsx"])));
    expect(saveCaseProjects).not.toHaveBeenCalled();
    next.next(ok(casePage()));
  });
  it("ошибка/retry сохраняет контекст, а отказ прав выключает export", () => {
    get.execute.mockReturnValue(of(fail({ kind: "network" })));
    service.open(12, selectedCase, caseMetrics);
    expect(service.error()?.kind).toBe("network");
    expect(service.pending()).toBe(false);
    expect(service.canExport()).toBe(false);
    get.execute.mockReturnValue(of(ok(casePage())));
    service.load();
    expect(service.error()).toBeNull();
    download.execute.mockReturnValue(of(fail({ kind: "forbidden" })));
    service.download();
    expect(service.exportError()?.kind).toBe("forbidden");
    expect(service.canExport()).toBe(false);
  });
  it("combines filters and search, resets pagination, and exports all matching rows", () => {
    service.open(12, selectedCase);
    service.offset.set(25);
    service.searchDraft.set("  Проект  ");
    service.setSubmission("submitted");
    service.setPresentation("missing");
    const filters = { search: "Проект", submission: "submitted", presentation: "missing" };
    expect(get.execute).toHaveBeenLastCalledWith(12, {
      selection: selectedCase,
      ...filters,
      limit: 25,
      offset: 0,
    });
    service.download();
    expect(download.execute).toHaveBeenCalledExactlyOnceWith(12, selectedCase, filters);
    service.clearFilters();
    expect(service.hasFilters()).toBe(false);
    expect(get.execute.mock.lastCall?.[1]).toMatchObject({
      search: "",
      submission: "all",
      presentation: "all",
      offset: 0,
    });
  });
  it("changing pages preserves a download with the same filters", () => {
    get.execute.mockReturnValue(
      of(
        ok(
          casePage({
            count: 26,
            results: Array.from({ length: 25 }, (_, i) => caseProject({ programProjectId: i + 1 })),
          }),
        ),
      ),
    );
    service.open(12, selectedCase);
    const file = new Subject<any>();
    download.execute.mockReturnValue(file);
    service.download();
    get.execute.mockReturnValue(of(ok(casePage({ count: 26, results: [caseProject()] }))));
    service.changePage(1);
    expect(service.offset()).toBe(25);
    expect(file.observed).toBe(true);
    expect(service.exportPending()).toBe(true);
    file.next(ok(new Blob(["xlsx"])));
    expect(saveCaseProjects).toHaveBeenCalledTimes(1);
  });
  it("filter changes cancel stale downloads and keep export disabled while loading", () => {
    service.open(12, selectedCase);
    const file = new Subject<any>();
    const next = new Subject<any>();
    download.execute.mockReturnValue(file);
    service.download();
    get.execute.mockReturnValue(next);
    service.setPresentation("present");
    expect(file.observed).toBe(false);
    expect(service.canExport()).toBe(false);
    file.next(ok(new Blob(["stale"])));
    expect(saveCaseProjects).not.toHaveBeenCalled();
    next.next(ok(casePage()));
    expect(service.canExport()).toBe(true);
  });
  it("all проверяет одну строку, но выгружает весь scope", () => {
    get.execute.mockReturnValue(
      of(ok(casePage({ selection: { scope: "all", caseName: null }, caseMetrics: null }))),
    );
    service.open(12, { scope: "all" });
    expect(get.execute).toHaveBeenCalledExactlyOnceWith(12, {
      selection: { scope: "all" },
      search: "",
      submission: "all",
      presentation: "all",
      offset: 0,
      limit: 1,
    });
    service.download();
    expect(download.execute).toHaveBeenCalledExactlyOnceWith(
      12,
      { scope: "all" },
      { search: "", submission: "all", presentation: "all" },
    );
  });
});
