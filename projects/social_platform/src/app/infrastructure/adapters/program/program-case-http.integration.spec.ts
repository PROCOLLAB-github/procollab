/** @format */
import { TestBed } from "@angular/core/testing";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { API_URL, CamelcaseInterceptor } from "@corelib";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProgramRepository } from "@infrastructure/repository/program/program.repository";
import { ExportProgramCaseProjectsUseCase } from "@api/program/use-cases/export-program-case-projects.use-case";
import { firstValueFrom } from "rxjs";

describe("Case export: HTTP → camelCase → repository → contract guard → XLSX", () => {
  let http: HttpTestingController;
  const selection = { scope: "selected", caseName: "Кейс + &=100%" } as const;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: "/api" },
        { provide: HTTP_INTERCEPTORS, useClass: CamelcaseInterceptor, multi: true },
        { provide: ProgramRepositoryPort, useClass: ProgramRepository },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it("принимает настоящий snake_case DTO и затем запрашивает только полный scope", async () => {
    const promise = firstValueFrom(
      TestBed.inject(ExportProgramCaseProjectsUseCase).execute(12, selection),
    );
    const list = http.expectOne(req => req.url === "/api/programs/12/projects/");
    expect(list.request.params.get("case_name")).toBe("Кейс + &=100%");
    expect(list.request.params.get("view")).toBe("case_analytics");
    list.flush({
      count: 1,
      next: null,
      previous: null,
      cases_configured: true,
      submission_applicable: true,
      selection: { scope: "selected", case_name: selection.caseName },
      case_metrics: { projects_total: 1, participants_total: 1, submitted: 1, not_submitted: 0 },
      results: [
        {
          program_project_id: 901,
          project: {
            id: 73,
            name: "Проект",
            presentation_address: "https://example.org/p.pdf",
            region: null,
          },
          case: { kind: "selected", name: selection.caseName },
          leader: { user_id: 7, full_name: "Анна Иванова" },
          team_size: 2,
          linked_at: "2026-09-01T10:00:00Z",
          submitted: true,
          submitted_at: null,
        },
      ],
    });
    const file = http.expectOne(req => req.url === "/api/programs/12/export-projects/");
    expect(file.request.responseType).toBe("blob");
    expect(file.request.params.keys().sort()).toEqual(["case_name", "case_scope", "view"]);
    const blob = new Blob(["xlsx fixture"]);
    file.flush(blob);
    expect(await promise).toEqual({ ok: true, value: blob });
  });
  it("legacy HTTP 200 не вызывает export endpoint", async () => {
    const promise = firstValueFrom(
      TestBed.inject(ExportProgramCaseProjectsUseCase).execute(12, selection),
    );
    http
      .expectOne(req => req.url === "/api/programs/12/projects/")
      .flush({
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 73, name: "Обычный ProjectList" }],
      });
    expect(await promise).toEqual({ ok: false, error: { kind: "unsupported" } });
    http.expectNone(req => req.url.includes("export-projects"));
  });
});
