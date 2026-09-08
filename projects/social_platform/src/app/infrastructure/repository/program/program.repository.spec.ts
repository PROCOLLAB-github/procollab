/** @format */

import { TestBed } from "@angular/core/testing";
import { firstValueFrom, of, Subject } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ProgramRepository } from "./program.repository";
import { ProgramHttpAdapter } from "../../adapters/program/program-http.adapter";
import { Program, ProgramDataSchema } from "@domain/program/program.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Project } from "@domain/project/project.model";
import { User } from "@domain/auth/user.model";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";
import { ProjectAdditionalFields } from "@domain/project/project-additional-fields.model";
import { ProgramCreate } from "@domain/program/program-create.model";
import { ProgramAnalyticsOverview } from "@domain/program/program-analytics.model";

describe("ProgramRepository", () => {
  let repository: ProgramRepository;
  let adapter: any;

  function setup(): void {
    adapter = {
      getAll: vi.fn(),
      getOne: vi.fn(),
      getManagerOverview: vi.fn(),
      getManagerAssignments: vi.fn(),
      getManagerAssignmentScores: vi.fn(),
      create: vi.fn(),
      getDataSchema: vi.fn(),
      register: vi.fn(),
      acknowledgeWelcome: vi.fn(),
      getAllProjects: vi.fn(),
      getAllMembers: vi.fn(),
      getProgramFilters: vi.fn(),
      getProgramProjectAdditionalFields: vi.fn(),
      applyProjectToProgram: vi.fn(),
      createProgramFilters: vi.fn(),
      submitCompettetiveProject: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [ProgramRepository, { provide: ProgramHttpAdapter, useValue: adapter }],
    });
    repository = TestBed.inject(ProgramRepository);
  }

  const page = <T>(): ApiPagination<T> => ({
    count: 0,
    results: [] as T[],
    next: "",
    previous: "",
  });

  it("getAll делегирует в adapter", () => {
    setup();
    const params = new HttpParams();
    adapter.getAll.mockReturnValue(of(page<Program>()));
    repository.getAll(0, 10, params).subscribe();
    expect(adapter.getAll).toHaveBeenCalledExactlyOnceWith(0, 10, params);
  });

  it("drilldown делегирует scope/id без кеширования manager данных", () => {
    setup();
    adapter.getManagerAssignments.mockReturnValue(of([]));
    adapter.getManagerAssignmentScores.mockReturnValue(of({}));
    repository.getManagerAssignments(12, "pending").subscribe();
    repository.getManagerAssignments(12, "pending").subscribe();
    repository.getManagerAssignmentScores(12, 17).subscribe();
    expect(adapter.getManagerAssignments).toHaveBeenCalledWith(12, "pending");
    expect(adapter.getManagerAssignments).toHaveBeenCalledTimes(2);
    expect(adapter.getManagerAssignmentScores).toHaveBeenCalledExactlyOnceWith(12, 17);
  });

  it("getOne кеширует результат: повторный вызов не бьёт adapter", () => {
    setup();
    adapter.getOne.mockReturnValue(of({ id: 42 } as Program));

    repository.getOne(42).subscribe();
    repository.getOne(42).subscribe();

    expect(adapter.getOne).toHaveBeenCalledTimes(1);
  });

  it("getManagerOverview делегирует в adapter", () => {
    setup();
    adapter.getManagerOverview.mockReturnValue(of({} as ProgramAnalyticsOverview));

    repository.getManagerOverview(42).subscribe();

    expect(adapter.getManagerOverview).toHaveBeenCalledExactlyOnceWith(42);
  });

  it("create делегирует в adapter", () => {
    setup();
    adapter.create.mockReturnValue(of({ id: 1 } as Program));
    const data = { name: "p" } as ProgramCreate;
    repository.create(data).subscribe();
    expect(adapter.create).toHaveBeenCalledExactlyOnceWith(data);
  });

  it("getDataSchema разворачивает response.dataSchema", () =>
    new Promise<void>(done => {
      setup();
      const schema = { city: { name: "Город", placeholder: "" } } as unknown as ProgramDataSchema;
      adapter.getDataSchema.mockReturnValue(of({ dataSchema: schema }));

      repository.getDataSchema(1).subscribe(res => {
        expect(res).toBe(schema);
        done();
      });
    }));

  it("register делегирует в adapter", () => {
    setup();
    adapter.register.mockReturnValue(of({} as ProgramDataSchema));
    repository.register(1, { city: "Москва" }).subscribe();
    expect(adapter.register).toHaveBeenCalledExactlyOnceWith(1, { city: "Москва" });
  });

  it("подтверждает приветствие и сбрасывает кеш detail программы", () => {
    setup();
    adapter.getOne.mockReturnValue(of({ id: 1 } as Program));
    adapter.acknowledgeWelcome.mockReturnValue(
      of({ welcomeAcknowledgedAt: "2026-08-24T10:00:00Z" }),
    );

    repository.getOne(1).subscribe();
    repository.acknowledgeWelcome(1).subscribe();
    repository.getOne(1).subscribe();

    expect(adapter.acknowledgeWelcome).toHaveBeenCalledExactlyOnceWith(1);
    expect(adapter.getOne).toHaveBeenCalledTimes(2);
  });

  it("string detail key is invalidated by numeric welcome acknowledgement before TTL", async () => {
    setup();
    const runtimeId = "7" as unknown as number;
    const stale = { ...Program.default(), id: 7, welcomeAcknowledgedAt: null };
    const fresh = { ...stale, welcomeAcknowledgedAt: "2026-09-07T10:00:00Z" };
    adapter.getOne.mockReturnValueOnce(of(stale)).mockReturnValueOnce(of(fresh));
    adapter.acknowledgeWelcome.mockReturnValue(
      of({ welcomeAcknowledgedAt: fresh.welcomeAcknowledgedAt }),
    );

    expect(await firstValueFrom(repository.getOne(runtimeId))).toBe(stale);
    expect(adapter.getOne).toHaveBeenCalledTimes(1);
    await firstValueFrom(repository.acknowledgeWelcome(7));
    expect(await firstValueFrom(repository.getOne(runtimeId))).toBe(fresh);
    expect(adapter.getOne).toHaveBeenCalledTimes(2);
    expect(adapter.getOne.mock.calls).toEqual([[7], [7]]);
    expect(adapter.acknowledgeWelcome).toHaveBeenCalledExactlyOnceWith(7);
  });

  it("string and number share one cache key; acknowledging 7 preserves cached program 8", async () => {
    setup();
    const seventh = { ...Program.default(), id: 7 };
    const eighth = { ...Program.default(), id: 8 };
    adapter.getOne.mockImplementation((id: number) => of(id === 7 ? seventh : eighth));
    adapter.acknowledgeWelcome.mockReturnValue(
      of({ welcomeAcknowledgedAt: "2026-09-07T10:00:00Z" }),
    );

    await firstValueFrom(repository.getOne("7" as unknown as number));
    expect(await firstValueFrom(repository.getOne(7))).toBe(seventh);
    await firstValueFrom(repository.getOne("8" as unknown as number));
    expect(adapter.getOne.mock.calls).toEqual([[7], [8]]);
    await firstValueFrom(repository.acknowledgeWelcome("7" as unknown as number));
    await firstValueFrom(repository.getOne(7));
    expect(await firstValueFrom(repository.getOne(8))).toBe(eighth);
    expect(adapter.getOne.mock.calls).toEqual([[7], [8], [7]]);
    expect(adapter.acknowledgeWelcome).toHaveBeenCalledExactlyOnceWith(7);
  });

  it("does not invalidate before POST success or after an error; permits retry", async () => {
    setup();
    const program = { ...Program.default(), id: 7, welcomeAcknowledgedAt: null };
    const response = new Subject<{ welcomeAcknowledgedAt: string }>();
    adapter.getOne.mockReturnValue(of(program));
    adapter.acknowledgeWelcome
      .mockReturnValueOnce(response)
      .mockReturnValueOnce(of({ welcomeAcknowledgedAt: "2026-09-07T10:00:00Z" }));
    await firstValueFrom(repository.getOne("7" as unknown as number));
    const error = vi.fn();
    repository.acknowledgeWelcome(7).subscribe({ error });
    expect(await firstValueFrom(repository.getOne(7))).toBe(program);
    expect(adapter.getOne).toHaveBeenCalledTimes(1);
    response.error(new Error("POST failed"));
    expect(error).toHaveBeenCalledOnce();
    expect(await firstValueFrom(repository.getOne(7))).toBe(program);
    expect(adapter.getOne).toHaveBeenCalledTimes(1);
    expect(program.welcomeAcknowledgedAt).toBeNull();

    await firstValueFrom(repository.acknowledgeWelcome(7));
    await firstValueFrom(repository.getOne("7" as unknown as number));
    expect(adapter.getOne).toHaveBeenCalledTimes(2);
  });

  it.each([NaN, 0, -7, 1.5, Infinity, "abc", "0", "-7", "1.5", "", undefined, null])(
    "rejects invalid runtime id %s through Observable errors without HTTP",
    async invalidId => {
      setup();
      const id = invalidId as number;
      const detail = repository.getOne(id);
      const acknowledgement = repository.acknowledgeWelcome(id);
      await expect(firstValueFrom(detail)).rejects.toBeInstanceOf(Error);
      await expect(firstValueFrom(acknowledgement)).rejects.toBeInstanceOf(Error);
      expect(adapter.getOne).not.toHaveBeenCalled();
      expect(adapter.acknowledgeWelcome).not.toHaveBeenCalled();
    },
  );

  it("getAllProjects делегирует в adapter", () => {
    setup();
    const params = new HttpParams();
    adapter.getAllProjects.mockReturnValue(of(page<Project>()));
    repository.getAllProjects(1, params).subscribe();
    expect(adapter.getAllProjects).toHaveBeenCalledExactlyOnceWith(1, params);
  });

  it("getAllMembers делегирует в adapter", () => {
    setup();
    adapter.getAllMembers.mockReturnValue(of(page<User>()));
    repository.getAllMembers(1, 0, 10).subscribe();
    expect(adapter.getAllMembers).toHaveBeenCalledExactlyOnceWith(1, 0, 10);
  });

  it("getProgramFilters делегирует в adapter", () => {
    setup();
    adapter.getProgramFilters.mockReturnValue(of([] as PartnerProgramFields[]));
    repository.getProgramFilters(1).subscribe();
    expect(adapter.getProgramFilters).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("getProgramProjectAdditionalFields делегирует в adapter", () => {
    setup();
    adapter.getProgramProjectAdditionalFields.mockReturnValue(of({} as ProjectAdditionalFields));
    repository.getProgramProjectAdditionalFields(1).subscribe();
    expect(adapter.getProgramProjectAdditionalFields).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("applyProjectToProgram делегирует в adapter и после успеха сбрасывает кеш программы", () => {
    setup();
    const dto = { project: {} as Project, programFieldValues: [] };
    adapter.getOne.mockReturnValue(of({ ...Program.default(), id: 1 }));
    adapter.applyProjectToProgram.mockReturnValue(of({ projectId: 1, programLinkId: 2 }));

    repository.getOne(1).subscribe();
    repository.applyProjectToProgram(1, dto).subscribe();
    repository.getOne(1).subscribe();

    expect(adapter.applyProjectToProgram).toHaveBeenCalledExactlyOnceWith(1, dto);
    expect(adapter.getOne).toHaveBeenCalledTimes(2);
  });

  it("createProgramFilters делегирует в adapter", () => {
    setup();
    const params = new HttpParams();
    adapter.createProgramFilters.mockReturnValue(of(page<Project>()));
    repository.createProgramFilters(1, { status: ["open"] }, params).subscribe();
    expect(adapter.createProgramFilters).toHaveBeenCalledExactlyOnceWith(
      1,
      { status: ["open"] },
      params,
    );
  });

  it("submitCompettetiveProject делегирует в adapter", () => {
    setup();
    adapter.submitCompettetiveProject.mockReturnValue(of({} as Project));
    repository.submitCompettetiveProject(42).subscribe();
    expect(adapter.submitCompettetiveProject).toHaveBeenCalledExactlyOnceWith(42);
  });
});
