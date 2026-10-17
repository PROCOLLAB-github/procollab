/** @format */

import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { ActivatedRoute, Router, provideRouter } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { of, Subject, throwError } from "rxjs";
import { FileService } from "@corelib";
import {
  ManagementContext,
  ProgramManagementService,
} from "@api/program/facades/detail/program-management.service";
import {
  ManagementProject,
  ManagementProjectsPage,
  ProgramManagement,
} from "@domain/program/program-management.model";
import { ProgramManagementComponent } from "./management.component";

const program = {
  id: 1,
  name: "Программа",
  city: "Москва",
  tag: "кейс",
  description: "Описание",
  updatedAt: "2026-10-17T12:00:00.123456Z",
  datetimeStarted: "2026-10-01T12:00:00.123Z",
  datetimeFinished: "2026-11-01T12:00:00Z",
  datetimeRegistrationEnds: "2026-10-20T12:00:00Z",
  datetimeProjectSubmissionEnds: null,
  datetimeEvaluationEnds: null,
  materials: [],
  isCompetitive: true,
} as unknown as ProgramManagement;
describe("Сохранение настроек организатора", () => {
  function setup() {
    const save = vi.fn(() => of(program));
    const state = { program: signal(program), api: { save } };
    TestBed.configureTestingModule({
      providers: [
        { provide: ProgramManagementService, useValue: state },
        { provide: FileService, useValue: {} },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
        {
          provide: Router,
          useValue: { events: new Subject(), navigate: vi.fn().mockResolvedValue(true) },
        },
      ],
    });
    const component = TestBed.runInInjectionContext(() => new ProgramManagementComponent());
    TestBed.flushEffects();
    component.resetForms();
    return { component, state, save };
  }
  it("отмена ухода сохраняет введённые значения и dirty", async () => {
    const { component } = setup();
    component.basicForm.controls.name.setValue("Новое имя");
    component.basicForm.controls.name.markAsDirty();
    const result = component.canLeave();
    expect(component.confirmation()?.safeCancel).toBe(true);
    component.resolveConfirmation(false);
    expect(await result).toBe(false);
    expect(component.basicForm.controls.name.value).toBe("Новое имя");
    expect(component.basicForm.dirty).toBe(true);
  });
  it("подтверждённый уход очищает dirty", async () => {
    const { component } = setup();
    component.basicForm.markAsDirty();
    const result = component.canLeave();
    component.resolveConfirmation(true);
    expect(await result).toBe(true);
    expect(component.dirty()).toBe(false);
  });
  it("сохраняет только изменённые поля и исходную версию", () => {
    const { component, save } = setup();
    component.settingsTab.set("basic");
    component.basicForm.controls.name.setValue("Новое имя");
    component.basicForm.controls.name.markAsDirty();
    component.save();
    expect(save).toHaveBeenCalledWith(1, "basic", {
      expectedUpdatedAt: program.updatedAt,
      confirmReopen: false,
      name: "Новое имя",
    });
  });
  it("409 не теряет значения формы", () => {
    const { component, save } = setup();
    save.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { code: "stale_settings", detail: "Данные изменились" },
          }),
      ),
    );
    component.settingsTab.set("basic");
    component.basicForm.controls.name.setValue("Мой текст");
    component.basicForm.controls.name.markAsDirty();
    component.save();
    expect(component.basicForm.controls.name.value).toBe("Мой текст");
    expect(component.basicForm.dirty).toBe(true);
    expect(component.formError()).toContain("Данные изменились");
  });
});

describe("Списки управления программой в DOM", () => {
  async function setup(section = "participants", query = "") {
    const project: ManagementProject = {
      id: 11,
      projectId: 91,
      name: "Первый проект",
      leader: { id: 7, name: "Анна" },
      submitted: false,
      evaluationStatus: "not_submitted",
      assignmentsTotal: null,
      assignmentsCompleted: null,
      caseName: null,
      presentationUrl: null,
    };
    const state = {
      program: signal(program),
      participants: signal({
        count: 1,
        results: [{ id: 1, name: "Анна", email: "anna@example.com" }],
      }),
      projects: signal<ManagementProjectsPage | null>({
        count: 1,
        results: [project],
        caseOptions: ["Кейс №1"],
        next: null,
        previous: null,
        isCompetitive: true,
      }),
      selected: signal<ManagementProject | null>(null),
      pending: signal(false),
      error: signal(null),
      evaluation: signal(null),
      teamOpen: signal(false),
      teamPending: signal(false),
      teamError: signal(null),
      team: signal(null),
      context: null as ManagementContext | null,
      api: {},
      load: vi.fn((ctx: ManagementContext) => {
        state.context = ctx;
      }),
      select: vi.fn((row: ManagementProject) => state.selected.set(row)),
      clearSelection: vi.fn(() => state.selected.set(null)),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: "office/program/:programId",
            children: [{ path: "management/:section", component: ProgramManagementComponent }],
          },
        ]),
        { provide: FileService, useValue: {} },
      ],
    }).overrideComponent(ProgramManagementComponent, {
      set: { providers: [{ provide: ProgramManagementService, useValue: state }] },
    });
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      `/office/program/1/management/${section}${query}`,
      ProgramManagementComponent,
    );
    const element = () => harness.routeNativeElement!;
    return { harness, component, state, project, element };
  }

  it.each(["participants", "projects"])(
    "%s: обновление списка не уничтожает поле поиска и его ввод",
    async section => {
      const { harness, component, state, element } = await setup(section);
      const input = element().querySelector<HTMLInputElement>("input[type=search]")!;
      input.focus();
      input.value = "Анна";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      state.pending.set(true);
      harness.detectChanges();
      expect(element().querySelector("input[type=search]")).toBe(input);
      expect(document.activeElement).toBe(input);
      expect(input.value).toBe("Анна");
      expect(element().textContent).toContain("Обновляем список");
      state.pending.set(false);
      harness.detectChanges();
      expect(element().querySelector("input[type=search]")).toBe(input);
      expect(component.search.value).toBe("Анна");
    },
  );

  it("завершение навигации старого поискового запроса не стирает более новый ввод", async () => {
    const { component } = await setup();
    const router = TestBed.inject(Router);
    const navigation = vi.spyOn(router, "navigate");
    component.search.setValue("Ан");
    component.submitSearch();
    component.search.setValue("Анна");
    await navigation.mock.results[0].value;
    expect(component.search.value).toBe("Анна");
    expect(router.url).toContain("search=");
  });

  it("сохраняет выбранный кейс после появления вариантов и восстановления URL", async () => {
    const { harness, component, state, element } = await setup("projects");
    state.projects.set(null);
    await harness.navigateByUrl(
      "/office/program/1/management/projects?case_scope=selected&case_name=Кейс%20№1",
    );
    state.projects.set({
      count: 0,
      results: [],
      caseOptions: ["Кейс №1", "Кейс №2"],
      next: null,
      previous: null,
      isCompetitive: true,
    });
    harness.detectChanges();
    expect(element().querySelector("select")!.value).toBe("case:Кейс №1");
    expect(component.caseFilter.value).toBe("case:Кейс №1");
  });

  it("повторный клик по кружку или строке снимает выбор, ссылка не меняет выбор", async () => {
    const { harness, state, element } = await setup("projects");
    const radio = () => element().querySelector<HTMLInputElement>('input[type="radio"]')!;
    radio().click();
    harness.detectChanges();
    expect(state.selected()?.id).toBe(11);
    radio().click();
    harness.detectChanges();
    expect(state.selected()).toBeNull();
    expect(radio().checked).toBe(false);
    radio().dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }),
    );
    harness.detectChanges();
    expect(state.selected()?.id).toBe(11);
    radio().dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }),
    );
    harness.detectChanges();
    expect(state.selected()).toBeNull();
    const rowCell = () =>
      element().querySelector<HTMLElement>("tbody td[data-label=Руководитель]")!;
    rowCell().click();
    harness.detectChanges();
    expect(state.selected()?.id).toBe(11);
    rowCell().click();
    harness.detectChanges();
    expect(state.selected()).toBeNull();
    radio().click();
    harness.detectChanges();
    vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    element().querySelector<HTMLAnchorElement>("tbody a")!.click();
    harness.detectChanges();
    expect(state.selected()?.id).toBe(11);
  });
});
