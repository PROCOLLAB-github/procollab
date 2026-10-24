/** @format */

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom } from "rxjs";
import snakecaseKeys from "snakecase-keys";
import { CamelcaseInterceptor } from "@core/lib/interceptors/camelcase.interceptor";
import { API_URL } from "@core/lib/providers";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import { SolutionRepository } from "@infrastructure/repository/solution/solution.repository";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import {
  CreateSolutionInvitationUseCase,
  DecideSolutionInvitationUseCase,
  GetMySolutionInvitationsUseCase,
  GetSolutionInvitationsUseCase,
  LeaveSolutionUseCase,
  RemoveSolutionMemberUseCase,
  RevokeSolutionInvitationUseCase,
  TransferSolutionCaptainUseCase,
  UpdateSolutionInvitationUseCase,
} from "./use-cases/solution-team.use-cases";

describe("C00 team and invitation wire contracts", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: "https://local.test" },
        { provide: HTTP_INTERCEPTORS, useClass: CamelcaseInterceptor, multi: true },
        { provide: LoggerService, useValue: { warn: vi.fn() } },
        { provide: SolutionRepositoryPort, useExisting: SolutionRepository },
      ],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it("sends selected recipient ID and role without Project/Team IDs", async () => {
    const result = firstValueFrom(
      TestBed.inject(CreateSolutionInvitationUseCase).execute(12, 301, {
        expectedSolutionVersion: 8,
        recipientUserId: 9,
        role: "Аналитик",
      }),
    );
    const request = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/programs/12/solutions/301/invitations/",
    );
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toEqual({
      expected_solution_version: 8,
      recipient_user_id: 9,
      role: "Аналитик",
    });
    const expected = solutionContractScenarios.find(s => s.name === "create_invitation")!.response;
    request.flush(snakecaseKeys(expected as object, { deep: true }));
    expect(await result).toEqual({ ok: true, value: expected });
  });

  it("preserves both invitation and solution versions in PATCH and DELETE query", async () => {
    const updated = firstValueFrom(
      TestBed.inject(UpdateSolutionInvitationUseCase).execute(701, {
        expectedVersion: 1,
        expectedSolutionVersion: 8,
        role: null,
      }),
    );
    const patch = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/solution-invitations/701/",
    );
    expect(patch.request.method).toBe("PATCH");
    expect(patch.request.body).toEqual({
      expected_version: 1,
      expected_solution_version: 8,
      role: null,
    });
    patch.flush({ invitation: { id: 701, version: 2 }, solution_version: 9 });
    expect(await updated).toEqual({
      ok: true,
      value: { invitation: { id: 701, version: 2 }, solutionVersion: 9 },
    });
    const revoked = firstValueFrom(
      TestBed.inject(RevokeSolutionInvitationUseCase).execute(701, 2, 9),
    );
    const remove = TestBed.inject(HttpTestingController).expectOne(r =>
      r.url.endsWith("/solution-invitations/701/"),
    );
    expect(remove.request.method).toBe("DELETE");
    expect(remove.request.params.get("expected_version")).toBe("2");
    expect(remove.request.params.get("expected_solution_version")).toBe("9");
    remove.flush(null, { status: 204, statusText: "No Content" });
    expect((await revoked).ok).toBe(true);
  });

  it.each(["accept", "decline"] as const)(
    "%s needs only the invitation version and does not retry POST",
    async decision => {
      const result = firstValueFrom(
        TestBed.inject(DecideSolutionInvitationUseCase).execute(701, decision, 2),
      );
      const request = TestBed.inject(HttpTestingController).expectOne(
        `https://local.test/solution-invitations/701/${decision}/`,
      );
      expect(request.request.body).toEqual({ expected_version: 2 });
      request.flush(
        { code: "team_frozen", detail: "Команда зафиксирована.", errors: [], meta: {} },
        { status: 409, statusText: "Conflict" },
      );
      expect(await result).toMatchObject({ ok: false, error: { code: "team_frozen" } });
      TestBed.inject(HttpTestingController).expectNone(() => true);
    },
  );

  it("routes remove/leave/transfer by exact program, solution and user IDs", async () => {
    const removed = firstValueFrom(
      TestBed.inject(RemoveSolutionMemberUseCase).execute(12, 301, 9, 8),
    );
    const remove = TestBed.inject(HttpTestingController).expectOne(r =>
      r.url.endsWith("/programs/12/solutions/301/members/9/"),
    );
    expect(remove.request.params.get("expected_solution_version")).toBe("8");
    remove.flush({ solution_id: 301, solution_version: 9, updated_at: "2026-10-24T10:00:00Z" });
    expect(await removed).toMatchObject({ ok: true, value: { solutionVersion: 9 } });
    const transferred = firstValueFrom(
      TestBed.inject(TransferSolutionCaptainUseCase).execute(12, 301, {
        expectedSolutionVersion: 9,
        newCaptainUserId: 10,
      }),
    );
    const transfer = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/programs/12/solutions/301/captain/",
    );
    expect(transfer.request.body).toEqual({
      expected_solution_version: 9,
      new_captain_user_id: 10,
    });
    transfer.flush({ solution_id: 301, solution_version: 10, updated_at: "2026-10-24T10:00:01Z" });
    expect((await transferred).ok).toBe(true);
    const left = firstValueFrom(
      TestBed.inject(LeaveSolutionUseCase).execute(12, 301, { expectedSolutionVersion: 10 }),
    );
    const leave = TestBed.inject(HttpTestingController).expectOne(
      "https://local.test/programs/12/solutions/301/leave/",
    );
    expect(leave.request.body).toEqual({ expected_solution_version: 10 });
    leave.flush(null, { status: 204, statusText: "No Content" });
    expect((await left).ok).toBe(true);
  });

  it("uses independent inbox and captain list with status/pagination", async () => {
    const inbox = firstValueFrom(
      TestBed.inject(GetMySolutionInvitationsUseCase).execute({
        status: "pending",
        limit: 8,
        offset: 16,
      }),
    );
    const incoming = TestBed.inject(HttpTestingController).expectOne(
      r => r.url === "https://local.test/solution-invitations/",
    );
    expect(incoming.request.params.get("offset")).toBe("16");
    expect(incoming.request.params.get("status")).toBe("pending");
    incoming.flush({ count: 0, next: null, previous: null, results: [] });
    expect((await inbox).ok).toBe(true);
    const pending = firstValueFrom(
      TestBed.inject(GetSolutionInvitationsUseCase).execute(12, 301, { status: "accepted" }),
    );
    const outgoing = TestBed.inject(HttpTestingController).expectOne(r =>
      r.url.endsWith("/programs/12/solutions/301/invitations/"),
    );
    expect(outgoing.request.params.get("status")).toBe("accepted");
    outgoing.flush({ count: 0, next: null, previous: null, results: [] });
    expect((await pending).ok).toBe(true);
  });
});
