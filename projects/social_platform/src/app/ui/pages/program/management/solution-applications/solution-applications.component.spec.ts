/** @format */
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { of, Subject } from "rxjs";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import { ProgramManagement } from "@domain/program/program-management.model";
import {
  ProgramSolution,
  SolutionFormManagement,
  SolutionManagerSolutions,
} from "@domain/solution/solution-contract.model";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { SolutionApplicationsComponent } from "./solution-applications.component";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
vi.mock("file-saver", () => ({ saveAs: vi.fn() }));

const page = solutionContractScenarios.find(s => s.name === "manager_solutions_field_present_zero")!
  .response as SolutionManagerSolutions;
const form = solutionContractScenarios.find(s => s.name === "form_management")!
  .response as SolutionFormManagement;
const detail = solutionContractScenarios.find(s => s.name === "created_solo")!
  .response as ProgramSolution;
const program = {
  id: 12,
  name: "Программа",
  solutionStorageMode: "solution",
  isCompetitive: true,
} as ProgramManagement;
describe("Таблица заявок решения", () => {
  function setupApi() {
    const api = {
      managerSolutions: vi.fn(() => of(structuredClone(page))),
      managedForm: vi.fn(() => of(structuredClone(form))),
      list: vi.fn(() => of({ count: 0, next: null, previous: null, results: [] })),
      get: vi.fn(() => of({ ...structuredClone(detail), id: 301, programId: 12 })),
      exportAnalytics: vi.fn(() => of(new Blob(["xlsx"]))),
      previewCaseChange: vi.fn(),
      applyCaseChange: vi.fn(),
      previewSubmitAction: vi.fn(),
      applySubmitAction: vi.fn(),
      previewArchive: vi.fn(),
      applyArchive: vi.fn(),
      previewMemberRemoval: vi.fn(),
      applyMemberRemoval: vi.fn(),
      listAdministrativeChanges: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: SolutionRepositoryPort, useValue: api },
        { provide: EvaluationUseCase, useValue: { workspace: vi.fn() } },
      ],
    });
    return api;
  }
  async function setup() {
    const api = setupApi(),
      fixture = TestBed.createComponent(SolutionApplicationsComponent);
    fixture.componentRef.setInput("program", program);
    fixture.detectChanges();
    await fixture.whenStable();
    return { api, fixture, component: fixture.componentInstance };
  }
  it("сохраняет таблицу из восьми колонок, а материал находится в меню", async () => {
    const { api, component, fixture } = await setup();
    const headers = Array.from(
      fixture.nativeElement.querySelectorAll("thead th") as NodeListOf<HTMLElement>,
    ).map(el => el.textContent?.trim());
    expect(headers).toEqual([
      "",
      "№",
      "Решение",
      "Руководитель",
      "Сдача решения",
      "Оценивание",
      "Кейс",
      "Действия",
    ]);
    const field = form.form.fields.find(f => f.purpose === "presentation")!;
    api.get.mockReturnValue(
      of({
        ...detail,
        id: 301,
        programId: 12,
        form: form.form,
        answers: [{ fieldId: field.id, value: { url: "https://files.test/presentation.pdf" } }],
      }),
    );
    component.loadMaterial(page.results[0]);
    expect(component.actions(page.results[0]).find(a => a.id === "presentation")?.href).toBe(
      "https://files.test/presentation.pdf",
    );
    expect(fixture.nativeElement.querySelector('td[data-label="Презентация"]')).toBeNull();
  });
  it("использует те же серверные фильтры для списка и XLSX, включая нулевой ответ", async () => {
    const { api, fixture, component } = await setup();
    await TestBed.inject(Router).navigateByUrl(
      "/?search=Текст&field_id=701&answer_state=present&case_scope=selected&case_name=Экология&submission=submitted",
    );
    fixture.detectChanges();
    const filters = {
      search: "Текст",
      submission: "submitted",
      caseScope: "selected",
      caseName: "Экология",
      fieldId: 701,
      answerState: "present",
    };
    expect(api.managerSolutions).toHaveBeenLastCalledWith(12, { ...filters, limit: 20, offset: 0 });
    component.export();
    expect(api.exportAnalytics).toHaveBeenCalledExactlyOnceWith(12, {
      kind: "solutions",
      ...filters,
    });
  });
  it("не создает ссылку меню из неподходящего протокола материала", async () => {
    const { api, component } = await setup();
    const field = form.form.fields.find(f => f.purpose === "presentation")!;
    api.get.mockReturnValue(
      of({
        ...detail,
        id: 301,
        programId: 12,
        form: form.form,
        answers: [{ fieldId: field.id, value: { url: "javascript:alert(1)" } }],
      }),
    );
    component.loadMaterial(page.results[0]);
    expect(component.actions(page.results[0]).find(a => a.id === "presentation")).toBeUndefined();
  });
  it("выбирает все серверные страницы и очищает выбор при смене фильтра", async () => {
    const { api, fixture, component } = await setup();
    api.managerSolutions.mockImplementation((_program?: number, query?: { offset: number }) =>
      of({
        ...page,
        count: 2,
        next: query?.offset === 0 ? "next" : null,
        results: [
          {
            ...page.results[0],
            application: {
              ...page.results[0].application,
              solutionId: query?.offset === 0 ? 301 : 302,
            },
          },
        ],
      }),
    );
    component.selectAll();
    expect([...component.selected()]).toEqual([301, 302]);
    await TestBed.inject(Router).navigateByUrl("/?search=Другой");
    fixture.detectChanges();
    expect(component.selected().size).toBe(0);
  });
  it("читает архив отдельным API, исключает writers и не выгружает архив", async () => {
    const { api, component } = await setup();
    await TestBed.inject(Router).navigateByUrl(
      "/?participation=archived&field_id=701&answer_state=present",
    );
    expect(api.list).toHaveBeenLastCalledWith(12, {
      participation: "archived",
      search: undefined,
      offset: 0,
      limit: 20,
    });
    expect(component.actions(page.results[0]).map(a => a.id)).toEqual(["team", "history"]);
    component.export();
    expect(api.exportAnalytics).not.toHaveBeenCalled();
  });
  it("смена программы очищает приватную заявку и административный токен", async () => {
    const { api, fixture, component } = await setup();
    const slow = new Subject<ProgramSolution>();
    api.get.mockReturnValue(slow);
    component.open(page.results[0], true);
    component.caseRequest.set({ programId: 12, solutionId: 301, name: "Старая" });
    fixture.componentRef.setInput("program", { ...program, id: 13 });
    fixture.detectChanges();
    await fixture.whenStable();
    slow.next(detail);
    slow.complete();
    expect(component.detail()).toBeNull();
    expect(component.detailOpen()).toBe(false);
    expect(component.caseRequest()).toBeNull();
  });
  it("запоздалая выдача прошлого фильтра не заменяет текущий список", async () => {
    const { api, component } = await setup();
    const slow = new Subject<SolutionManagerSolutions>();
    api.managerSolutions.mockReturnValueOnce(slow);
    component.load();
    api.managerSolutions.mockReturnValue(of({ ...page, count: 0, results: [] }));
    await TestBed.inject(Router).navigateByUrl("/?search=Новый");
    slow.next(page);
    slow.complete();
    expect(component.rows()).toEqual([]);
    expect(component.count()).toBe(0);
  });
});
