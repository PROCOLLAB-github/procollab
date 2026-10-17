/** @format */

import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { Subject, of, throwError } from "rxjs";
import { ProgramManagementService, ManagementContext } from "./program-management.service";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import { ProgramDetailMainUIInfoService } from "./ui/program-detail-main-ui-info.service";
import {
  ManagementProject,
  ManagementTeam,
  ProgramManagement,
} from "@domain/program/program-management.model";

const program = { id: 1, name: "Программа", materials: [] } as unknown as ProgramManagement;
const first = { id: 11, projectId: 91, name: "Первый" } as ManagementProject;
const second = { id: 12, projectId: 92, name: "Второй" } as ManagementProject;
const page = (results: ManagementProject[]) => ({
  results,
  count: results.length,
  next: null,
  previous: null,
  caseOptions: [],
  isCompetitive: true,
});
const context = (id = 1): ManagementContext => ({
  programId: id,
  section: "projects",
  query: { search: "", limit: 25, offset: 0, submission: "all", caseScope: "all" },
});

describe("ProgramManagementService", () => {
  function setup() {
    const api = {
      get: vi.fn(() => of(program)),
      projects: vi.fn(() => of(page([first, second]))),
      participants: vi.fn(),
      team: vi.fn(),
      evaluation: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        ProgramManagementService,
        ProgramDetailMainUIInfoService,
        { provide: ProgramManagementUseCase, useValue: api },
      ],
    });
    return { api, service: TestBed.inject(ProgramManagementService) };
  }
  it("одновременно выбирает только один проект", () => {
    const { service } = setup();
    service.load(context());
    service.select(first);
    service.select(second);
    expect(service.selected()?.id).toBe(second.id);
  });
  it("очищает выбор, если проект исчез после фильтрации", () => {
    const { service, api } = setup();
    service.load(context());
    service.select(first);
    api.projects.mockReturnValue(of(page([second])));
    service.load({ ...context(), query: { ...context().query, search: "Второй" } });
    expect(service.selected()).toBeNull();
  });
  it("сохраняет выбор при обновлении той же выдачи", () => {
    const { service } = setup();
    service.load(context());
    service.select(first);
    service.retry();
    expect(service.selected()?.id).toBe(first.id);
  });
  it("не применяет поздний ответ предыдущей программы", () => {
    const { service, api } = setup();
    const old = new Subject<ProgramManagement>();
    api.get.mockReturnValueOnce(old);
    service.load(context());
    api.get.mockReturnValueOnce(of({ ...program, id: 2 }));
    service.load(context(2));
    old.next(program);
    old.complete();
    expect(service.program()?.id).toBe(2);
  });
  it("не показывает команду прошлого выбора", () => {
    const { service, api } = setup();
    const team = new Subject<ManagementTeam>();
    api.team.mockReturnValue(team);
    service.load(context());
    service.select(first);
    service.openTeam();
    service.select(second);
    team.next({ projectId: 91, programLinkId: 11, name: "Первый", members: [] });
    expect(service.team()).toBeNull();
    expect(service.teamOpen()).toBe(false);
  });
  it("команда использует id связи программы, а не глобальный projectId", () => {
    const { service, api } = setup();
    api.team.mockReturnValue(of({ members: [] }));
    service.load(context());
    service.select(first);
    service.openTeam();
    expect(api.team).toHaveBeenCalledWith(1, 11);
  });
  it("после 403 удаляет ранее загруженные приватные данные", () => {
    const { service, api } = setup();
    service.load(context());
    service.select(first);
    api.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    service.retry();
    expect(service.program()).toBeNull();
    expect(service.projects()).toBeNull();
    expect(service.selected()).toBeNull();
    expect(service.error()?.status).toBe(403);
  });
  it("восстанавливает выбор после возврата из оценок", () => {
    const { service } = setup();
    service.load({ ...context(), selectedId: second.id });
    expect(service.selected()?.id).toBe(second.id);
  });
});
