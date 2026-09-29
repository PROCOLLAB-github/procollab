/** @format */
import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { firstValueFrom, of, throwError } from "rxjs";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { casePage, selectedCase } from "@domain/program/program-case-analytics.fixture";
import { ProgramCaseSelection } from "@domain/program/program-case-analytics.model";
import { GetProgramCaseProjectsUseCase } from "./get-program-case-projects.use-case";
import { ExportProgramCaseProjectsUseCase } from "./export-program-case-projects.use-case";

describe("Case analytics: проверка контракта перед list/export", () => {
  const repository = { getCaseProjects: vi.fn(), exportCaseProjects: vi.fn() };
  let get: GetProgramCaseProjectsUseCase;
  let download: ExportProgramCaseProjectsUseCase;
  beforeEach(() => {
    repository.getCaseProjects.mockReset().mockReturnValue(of(casePage()));
    repository.exportCaseProjects.mockReset().mockReturnValue(of(new Blob(["xlsx"])));
    TestBed.configureTestingModule({
      providers: [{ provide: ProgramRepositoryPort, useValue: repository }],
    });
    get = TestBed.inject(GetProgramCaseProjectsUseCase);
    download = TestBed.inject(ExportProgramCaseProjectsUseCase);
  });
  it("возвращает проверенный DTO и nullable презентацию без detail fetch", async () => {
    const result = await firstValueFrom(get.execute(12, { selection: selectedCase }));
    expect(result).toEqual({ ok: true, value: casePage() });
    expect(repository.getCaseProjects).toHaveBeenCalledExactlyOnceWith(12, {
      selection: selectedCase,
    });
  });
  it.each([
    { count: 1, next: null, previous: null, results: [{ id: 1, name: "Legacy" }] },
    casePage({ selection: { scope: "without_case", caseName: null } }),
    casePage({ caseMetrics: null }),
    casePage({ results: [{ id: 1 } as any] }),
  ])("не подтверждает legacy/чужой/неполный контракт и не запрашивает файл", async value => {
    repository.getCaseProjects.mockReturnValue(of(value));
    expect(await firstValueFrom(download.execute(12, selectedCase))).toEqual({
      ok: false,
      error: { kind: "unsupported" },
    });
    expect(repository.exportCaseProjects).not.toHaveBeenCalled();
  });
  it.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "not_found"],
    [400, "invalid"],
    [500, "network"],
    [0, "network"],
  ])("контролируемая ошибка %s → %s", async (status, kind) => {
    repository.getCaseProjects.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: Number(status) })),
    );
    expect(await firstValueFrom(get.execute(12, { selection: selectedCase }))).toEqual({
      ok: false,
      error: { kind },
    });
    expect(await firstValueFrom(download.execute(12, selectedCase))).toEqual({
      ok: false,
      error: { kind },
    });
    expect(repository.exportCaseProjects).not.toHaveBeenCalled();
  });
  it.each([
    { scope: "all" },
    { scope: "without_case" },
    { scope: "selected", caseName: "Без выбранного кейса" },
  ] as ProgramCaseSelection[])("различает typed scope и настоящий option: %j", async selection => {
    const page = casePage({
      selection: {
        scope: selection.scope,
        caseName: selection.scope === "selected" ? selection.caseName : null,
      },
      caseMetrics:
        selection.scope === "all"
          ? null
          : { projectsTotal: 0, participantsTotal: 0, submitted: 0, notSubmitted: 0 },
      casesConfigured: selection.scope === "selected",
      count: 0,
      results: [],
    });
    repository.getCaseProjects.mockReturnValue(of(page));
    expect((await firstValueFrom(download.execute(12, selection))).ok).toBe(true);
    expect(repository.getCaseProjects).toHaveBeenCalledExactlyOnceWith(12, {
      selection,
      limit: 1,
      offset: 0,
    });
    expect(repository.exportCaseProjects).toHaveBeenCalledExactlyOnceWith(12, selection);
  });
  it("ошибка самого XLSX остаётся контролируемой", async () => {
    repository.exportCaseProjects.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 403 })),
    );
    expect(await firstValueFrom(download.execute(12, selectedCase))).toEqual({
      ok: false,
      error: { kind: "forbidden" },
    });
  });
});
