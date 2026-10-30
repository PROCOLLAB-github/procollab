/** @format */

import { TestBed } from "@angular/core/testing";
import { firstValueFrom, of, Subject } from "rxjs";
import { EventBus } from "@domain/shared/event-bus";
import { Program } from "@domain/program/program.model";
import { ProgramManagement } from "@domain/program/program-management.model";
import { ProgramManagementHttpAdapter } from "../../adapters/program/program-management-http.adapter";
import { ProgramHttpAdapter } from "../../adapters/program/program-http.adapter";
import { ProgramManagementRepository } from "./program-management.repository";
import { ProgramRepository } from "./program.repository";

describe("Кеш программы после возврата в черновик", () => {
  afterEach(() => TestBed.resetTestingModule());

  it("сбрасывает страницу и уведомляет каталог только после успешного перехода", async () => {
    const response = new Subject<ProgramManagement>();
    const read = vi.fn((id: number) => of({ ...Program.default(), id }));
    const write = vi.fn(() => response);
    TestBed.configureTestingModule({
      providers: [
        ProgramRepository,
        ProgramManagementRepository,
        { provide: ProgramHttpAdapter, useValue: { getOne: read } },
        { provide: ProgramManagementHttpAdapter, useValue: { returnToDraft: write } },
      ],
    });
    const programs = TestBed.inject(ProgramRepository);
    const management = TestBed.inject(ProgramManagementRepository);
    const changed = vi.fn();
    TestBed.inject(EventBus).on("ProgramUpdated").subscribe(changed);
    await firstValueFrom(programs.getOne(4));
    await firstValueFrom(programs.getOne(5));
    management.returnToDraft(4, "version").subscribe();
    await firstValueFrom(programs.getOne(4));
    expect(read).toHaveBeenCalledTimes(2);
    expect(changed).not.toHaveBeenCalled();
    response.next({ id: 4, draft: true } as ProgramManagement);
    response.complete();
    await firstValueFrom(programs.getOne(4));
    await firstValueFrom(programs.getOne(5));
    expect(read.mock.calls).toEqual([[4], [5], [4]]);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0][0].payload).toEqual({ programId: 4 });
  });

  it("ошибка не сообщает каталогу о смене статуса", () => {
    const response = new Subject<ProgramManagement>();
    TestBed.configureTestingModule({
      providers: [
        ProgramManagementRepository,
        { provide: ProgramManagementHttpAdapter, useValue: { returnToDraft: () => response } },
      ],
    });
    const changed = vi.fn();
    TestBed.inject(EventBus).on("ProgramUpdated").subscribe(changed);
    TestBed.inject(ProgramManagementRepository)
      .returnToDraft(4, "version")
      .subscribe({ error: () => {} });
    response.error(new Error("connection lost"));
    expect(changed).not.toHaveBeenCalled();
  });
});
