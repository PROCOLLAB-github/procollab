/** @format */
import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse, HttpParams } from "@angular/common/http";
import { ApiService } from "@corelib";
import { firstValueFrom, of, throwError } from "rxjs";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProgramHttpAdapter } from "@infrastructure/adapters/program/program-http.adapter";
import { ProgramRepository } from "@infrastructure/repository/program/program.repository";
import {
  participantsPage,
  projectsPage,
} from "@domain/program/program-analytics-attention.fixture";
import { GetProgramManagerParticipantsWithoutTeamUseCase } from "./get-program-manager-participants-without-team.use-case";
import { GetProgramManagerProjectsAwaitingEvaluationUseCase } from "./get-program-manager-projects-awaiting-evaluation.use-case";

describe("Attention: adapter → repository → use cases", () => {
  const api = { get: vi.fn() };
  beforeEach(() => {
    api.get.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: api },
        { provide: ProgramRepositoryPort, useClass: ProgramRepository },
      ],
    });
  });

  for (const [method, endpoint, useCase, page] of [
    [
      "getManagerParticipantsWithoutTeam",
      "participants-without-team",
      GetProgramManagerParticipantsWithoutTeamUseCase,
      participantsPage(),
    ],
    [
      "getManagerProjectsAwaitingEvaluation",
      "projects-awaiting-evaluation",
      GetProgramManagerProjectsAwaitingEvaluationUseCase,
      projectsPage(),
    ],
  ] as const) {
    const injectUseCase = () =>
      TestBed.inject<
        | GetProgramManagerParticipantsWithoutTeamUseCase
        | GetProgramManagerProjectsAwaitingEvaluationUseCase
      >(useCase);
    it(`${endpoint}: forwarding, response passthrough, отсутствие cache`, async () => {
      api.get.mockReturnValue(of(page));
      const adapter = TestBed.inject(ProgramHttpAdapter);
      const delegate = vi.spyOn(adapter, method);
      const service = injectUseCase();
      const query = { search: " Анна ", limit: 25, offset: 25 };
      expect(await firstValueFrom<unknown>(service.execute(12, query))).toEqual({
        ok: true,
        value: page,
      });
      await firstValueFrom<unknown>(service.execute(12, query));
      expect(delegate).toHaveBeenCalledTimes(2);
      expect(delegate).toHaveBeenLastCalledWith(12, query);
      expect(api.get).toHaveBeenCalledTimes(2);
      const [url, params] = api.get.mock.lastCall! as [string, HttpParams];
      expect(url).toBe(`/programs/12/manager-overview/${endpoint}/`);
      expect(params.get("search")).toBe("Анна");
      expect(params.get("limit")).toBe("25");
      expect(params.get("offset")).toBe("25");
    });

    it(`${endpoint}: default page, blank search absent`, async () => {
      api.get.mockReturnValue(of(page));
      await firstValueFrom<unknown>(injectUseCase().execute(12, { search: "  " }));
      const params = api.get.mock.lastCall![1] as HttpParams;
      expect(params.toString()).toBe("limit=25&offset=0");
    });

    it.each([
      [401, "unauthorized"],
      [403, "forbidden"],
      [404, "not_found"],
      [0, "network"],
      [500, "network"],
    ] as const)(`${endpoint}: %s не раскрывает HTTP body`, async (status, kind) => {
      api.get.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status, error: "secret backend body" })),
      );
      expect(await firstValueFrom<unknown>(injectUseCase().execute(12, {}))).toEqual({
        ok: false,
        error: { kind },
      });
    });
  }

  it("open mode: null assignment counters не превращаются в 0", async () => {
    const page = projectsPage({
      mode: "open",
      results: [
        {
          ...projectsPage().results[0],
          assignmentsTotal: null,
          assignmentsCompleted: null,
          reason: "awaiting_first_evaluation",
          reasonLabel: "Ожидает первой оценки",
        },
      ],
    });
    api.get.mockReturnValue(of(page));
    expect(
      await firstValueFrom(
        TestBed.inject(GetProgramManagerProjectsAwaitingEvaluationUseCase).execute(12, {}),
      ),
    ).toEqual({ ok: true, value: page });
  });
});
