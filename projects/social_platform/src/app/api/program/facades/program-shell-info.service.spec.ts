/** @format */

import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { ProgramShellInfoService } from "./program-shell-info.service";
import { ParticipatingProgramUseCase } from "../use-cases/participating-program.use-case";
import { EventBus } from "@domain/shared/event-bus";
import { ProgramUpdated } from "@domain/program/program-updated.event";
import { Program } from "@domain/program/program.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Result, ok } from "@domain/shared/result.type";
import { readCache, writeCache } from "@utils/cache";

describe("Обновление кеша программ после сохранения организатором", () => {
  let facade: ProgramShellInfoService;
  let bus: EventBus;
  let requests: Subject<Result<ApiPagination<Program>, unknown>>[];
  const result = (name: string) =>
    ok({
      count: 1,
      next: "",
      previous: "",
      results: [Object.assign(new Program(), { id: 7, name })],
    });
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    requests = [];
    TestBed.configureTestingModule({
      providers: [
        ProgramShellInfoService,
        EventBus,
        {
          provide: ParticipatingProgramUseCase,
          useValue: {
            execute: vi.fn(() => {
              const request = new Subject<Result<ApiPagination<Program>, unknown>>();
              requests.push(request);
              return request;
            }),
          },
        },
      ],
    });
    facade = TestBed.inject(ProgramShellInfoService);
    bus = TestBed.inject(EventBus);
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });
  const updated = (): ProgramUpdated => ({
    type: "ProgramUpdated",
    payload: { programId: 7 },
    occurredAt: new Date(),
  });
  it("очищает сохранённый кеш и запрашивает новое название", () => {
    writeCache("programs", 1, [Object.assign(new Program(), { id: 7, name: "Старое" })]);
    facade.ensureProgramsLoaded().subscribe();
    expect(facade.programs()[0].name).toBe("Старое");
    bus.emit(updated());
    expect(readCache("programs", 1, 3600000)).toBeNull();
    requests[1].next(result("Новое"));
    expect(facade.programs()[0].name).toBe("Новое");
  });
  it("старый запрос не возвращает прежние значения после успешного обновления", () => {
    facade.ensureProgramsLoaded().subscribe();
    bus.emit(updated());
    requests[1].next(result("Новое"));
    requests[0].next(result("Старое"));
    requests[0].complete();
    expect(facade.programs()[0].name).toBe("Новое");
    expect(readCache<Program[]>("programs", 1, 3600000)?.[0].name).toBe("Новое");
  });
});
