/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { firstValueFrom, of, Subject } from "rxjs";
import { ExpandService } from "@api/expand/expand.service";
import { NewsInfoService } from "@api/news/news-info.service";
import { LoadingService } from "@api/shared/loading.service";
import { AcknowledgeProgramWelcomeUseCase } from "@api/program/use-cases/acknowledge-program-welcome.use-case";
import { GetProgramUseCase } from "@api/program/use-cases/get-program.use-case";
import { FetchNewsUseCase } from "@api/program/use-cases/fetch-news.use-case";
import { ReadNewsUseCase } from "@api/program/use-cases/read-news.use-case";
import { AddNewsUseCase } from "@api/program/use-cases/add-news.use-case";
import { DeleteNewsUseCase } from "@api/program/use-cases/delete-news.use-case";
import { ToggleLikeUseCase } from "@api/program/use-cases/toggle-like.use-case";
import { EditNewsUseCase } from "@api/program/use-cases/edit-news.use-case";
import { Program } from "@domain/program/program.model";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProgramRepository } from "@infrastructure/repository/program/program.repository";
import { ProgramHttpAdapter } from "@infrastructure/adapters/program/program-http.adapter";
import { ProgramDetailMainService } from "./program-detail-main-info.service";
import { ProgramDetailMainUIInfoService } from "./ui/program-detail-main-ui-info.service";

describe("ProgramDetailMainService welcome acknowledgement with real repository/cache", () => {
  const timestamp = "2026-09-07T10:00:00Z";
  const stale: Program = {
    ...Program.default(),
    id: 7,
    isUserMember: true,
    welcomeAcknowledgedAt: null,
  };
  const fresh: Program = { ...stale, welcomeAcknowledgedAt: timestamp };
  let adapter: { getOne: ReturnType<typeof vi.fn>; acknowledgeWelcome: ReturnType<typeof vi.fn> };
  let service: ProgramDetailMainService;
  let ui: ProgramDetailMainUIInfoService;
  let post: Subject<{ welcomeAcknowledgedAt: string }>;

  beforeEach(() => {
    post = new Subject();
    adapter = {
      getOne: vi.fn().mockReturnValueOnce(of(stale)).mockReturnValue(of(fresh)),
      acknowledgeWelcome: vi
        .fn()
        .mockReturnValueOnce(post)
        .mockReturnValue(of({ welcomeAcknowledgedAt: timestamp })),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        ProgramDetailMainService,
        ProgramDetailMainUIInfoService,
        ProgramRepository,
        { provide: ProgramRepositoryPort, useExisting: ProgramRepository },
        { provide: ProgramHttpAdapter, useValue: adapter },
        { provide: LoadingService, useValue: {} },
        { provide: ExpandService, useValue: {} },
        { provide: NewsInfoService, useValue: { news: signal([]) } },
        ...[
          FetchNewsUseCase,
          ReadNewsUseCase,
          AddNewsUseCase,
          DeleteNewsUseCase,
          ToggleLikeUseCase,
          EditNewsUseCase,
        ].map(provide => ({ provide, useValue: {} })),
      ],
    });
    service = TestBed.inject(ProgramDetailMainService);
    ui = TestBed.inject(ProgramDetailMainUIInfoService);
  });

  async function loadProgram() {
    // Exercise legacy runtime string callers, not just already-normalized route data.
    const result = await firstValueFrom(
      TestBed.inject(GetProgramUseCase).execute("7" as unknown as number),
    );
    expect(result.ok).toBe(true);
    if (result.ok) ui.applyFormatingProgramData(result.value);
    ui.programId.set("7" as unknown as number);
  }

  it("closes only on success, blocks duplicate clicks and does not reopen on a fresh revisit", async () => {
    await loadProgram();
    expect(ui.registeredProgramModal()).toBe(true);
    expect(ui.program()?.welcomeAcknowledgedAt).toBeNull();

    service.acknowledgeProgramWelcome().subscribe();
    service.acknowledgeProgramWelcome().subscribe();
    expect(adapter.acknowledgeWelcome).toHaveBeenCalledExactlyOnceWith(7);
    expect(ui.welcomeAcknowledgementPending()).toBe(true);
    expect(ui.registeredProgramModal()).toBe(true);
    expect(ui.program()?.welcomeAcknowledgedAt).toBeNull();

    post.next({ welcomeAcknowledgedAt: timestamp });
    post.complete();
    expect(ui.welcomeAcknowledgementPending()).toBe(false);
    expect(ui.registeredProgramModal()).toBe(false);
    expect(ui.program()?.welcomeAcknowledgedAt).toBe(timestamp);

    ui.applyFormatingProgramData({ ...Program.default(), id: 8 });
    await loadProgram();
    expect(adapter.getOne.mock.calls).toEqual([[7], [7]]);
    expect(ui.program()).toBe(fresh);
    expect(ui.registeredProgramModal()).toBe(false);
    expect(adapter.acknowledgeWelcome).toHaveBeenCalledTimes(1);
  });

  it("failed POST retains the unacknowledged program/cache and allows a successful retry", async () => {
    await loadProgram();
    service.acknowledgeProgramWelcome().subscribe();
    post.error(new Error("POST failed"));
    expect(ui.welcomeAcknowledgementPending()).toBe(false);
    expect(ui.registeredProgramModal()).toBe(true);
    expect(ui.program()?.welcomeAcknowledgedAt).toBeNull();
    await loadProgram();
    expect(adapter.getOne).toHaveBeenCalledTimes(1);
    expect(ui.program()).toBe(stale);

    await firstValueFrom(service.acknowledgeProgramWelcome());
    expect(adapter.acknowledgeWelcome).toHaveBeenCalledTimes(2);
    expect(ui.registeredProgramModal()).toBe(false);
    expect(ui.program()?.welcomeAcknowledgedAt).toBe(timestamp);
    expect(ui.welcomeAcknowledgementPending()).toBe(false);
  });

  it("invalid repository IDs are handled by existing Result errors, without HTTP", async () => {
    const get = await firstValueFrom(TestBed.inject(GetProgramUseCase).execute(NaN));
    const acknowledge = await firstValueFrom(
      TestBed.inject(AcknowledgeProgramWelcomeUseCase).execute(0),
    );
    expect(get.ok).toBe(false);
    if (!get.ok) expect(get.error.kind).toBe("get_program_error");
    expect(acknowledge).toEqual({
      ok: false,
      error: { kind: "acknowledge_program_welcome_error" },
    });
    expect(adapter.getOne).not.toHaveBeenCalled();
    expect(adapter.acknowledgeWelcome).not.toHaveBeenCalled();
  });
});
