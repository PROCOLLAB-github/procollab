/** @format */
import { TestBed } from "@angular/core/testing";
import { firstValueFrom, of, throwError } from "rxjs";
import { ProgramLaunchUseCase } from "./program-launch.use-case";
import { ProgramLaunchRepositoryPort } from "@domain/program/ports/program-launch.repository.port";
import { ProgramLaunch } from "@domain/program/program-launch.model";
import { Program } from "@domain/program/program.model";
import { ProgramRepository } from "@infrastructure/repository/program/program.repository";
import { ProgramHttpAdapter } from "@infrastructure/adapters/program/program-http.adapter";

describe("Published program cache after launch", () => {
  function setup(draft: boolean) {
    TestBed.resetTestingModule();
    const state = { program: { id: 42, draft } } as ProgramLaunch;
    const port = {
      capabilities: vi.fn(),
      create: vi.fn(),
      managed: vi.fn(),
      preview: vi.fn(),
      readiness: vi.fn(() => of(state)),
      publish: vi.fn(() => of(state)),
    };
    const old = { id: 42, draft: true, description: "Старое описание" } as Program;
    const fresh = { id: 42, draft: false, description: "Описание после публикации" } as Program;
    const http = { getOne: vi.fn().mockReturnValueOnce(of(old)).mockReturnValue(of(fresh)) };
    TestBed.configureTestingModule({
      providers: [
        ProgramLaunchUseCase,
        ProgramRepository,
        { provide: ProgramLaunchRepositoryPort, useValue: port },
        { provide: ProgramHttpAdapter, useValue: http },
      ],
    });
    return {
      launch: TestBed.inject(ProgramLaunchUseCase),
      detail: TestBed.inject(ProgramRepository),
      port,
      http,
      old,
      fresh,
    };
  }

  it("refreshes cached detail when GET confirms a publication whose POST response was lost", async () => {
    const { launch, detail, port, http, old, fresh } = setup(false);
    expect(await firstValueFrom(detail.getOne(42))).toBe(old);
    port.publish.mockImplementation(() => throwError(() => new Error("Lost response")));
    await expect(firstValueFrom(launch.publish(42, "revision"))).rejects.toThrow("Lost response");
    expect(await firstValueFrom(detail.getOne(42))).toBe(old);
    expect(http.getOne).toHaveBeenCalledTimes(1);
    await firstValueFrom(launch.readiness(42));
    expect(await firstValueFrom(detail.getOne(42))).toBe(fresh);
    expect(http.getOne).toHaveBeenCalledTimes(2);
  });

  it("keeps cached detail when readiness still reports a draft", async () => {
    const { launch, detail, http, old } = setup(true);
    await firstValueFrom(detail.getOne(42));
    await firstValueFrom(launch.readiness(42));
    expect(await firstValueFrom(detail.getOne(42))).toBe(old);
    expect(http.getOne).toHaveBeenCalledTimes(1);
  });

  it("refreshes cached detail after the normal successful publication response", async () => {
    const { launch, detail, http, fresh } = setup(false);
    await firstValueFrom(detail.getOne(42));
    await firstValueFrom(launch.publish(42, "revision"));
    expect(await firstValueFrom(detail.getOne(42))).toBe(fresh);
    expect(http.getOne).toHaveBeenCalledTimes(2);
  });
});
