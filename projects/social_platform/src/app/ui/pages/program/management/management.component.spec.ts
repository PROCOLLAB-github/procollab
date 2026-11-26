/** @format */

import { TestBed } from "@angular/core/testing";
import { Component, signal } from "@angular/core";
import { ActivatedRoute, Router, provideRouter } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { Observable, of, Subject, throwError } from "rxjs";
import { saveAs } from "file-saver";
import { ApiService, FileService } from "@corelib";
import {
  ManagementContext,
  ProgramManagementService,
} from "@api/program/facades/detail/program-management.service";
import {
  ManagementProject,
  ManagementProjectsPage,
  ProgramManagement,
  ParticipantRemovalPreview,
  ParticipantExportJob,
  ManagementTeam,
  ManagementEvaluation,
} from "@domain/program/program-management.model";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { ProgramManagementComponent } from "./management.component";
import { ProgramProjectAssignmentSelection } from "@api/program/facades/detail/program-project-assignment-selection.service";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import { ExpertWorkspace } from "@domain/program/evaluation-workspace.model";

vi.mock("file-saver", () => ({ saveAs: vi.fn() }));

@Component({ template: "<h1>Профиль участника</h1>" })
class ProfileNavigationTarget {}
@Component({ template: "<h1>Вход</h1>" })
class LoginNavigationTarget {}

const program = {
  id: 1,
  name: "Программа",
  draft: false,
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

const evaluationWorkspace: ExpertWorkspace = {
  revision: "e1",
  requiredEvaluators: 1,
  managedEvaluation: true,
  submittedProjects: 2,
  missingAssignments: 1,
  readyProjects: 0,
  cases: ["Кейс №1"],
  experts: [
    {
      id: 11,
      userId: 101,
      name: "Мария Иванова",
      email: "maria@example.com",
      status: "joined",
      assigned: 1,
      completed: 0,
      remaining: 1,
    },
  ],
  projects: [
    {
      id: 91,
      name: "Назначенный проект",
      caseName: "Кейс №1",
      leaderId: 51,
      teamUserIds: [],
      experts: [
        {
          expertId: 11,
          name: "Мария Иванова",
          email: "maria@example.com",
          completed: false,
          protected: false,
        },
      ],
    },
    {
      id: 92,
      name: "Свободный проект",
      caseName: "Кейс №1",
      leaderId: 52,
      teamUserIds: [],
      experts: [],
    },
  ],
};
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
  it("отмена ухода сохраняет введенные значения и dirty", async () => {
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
  it.each(["2026-09-30T18:00", "2026-10-01T15:00", "2026-10-01T15:00:00"])(
    "не отправляет несогласованные сроки и сохраняет введенное окончание %s",
    finish => {
      const { component, save } = setup();
      component.settingsTab.set("dates");
      component.datesForm.controls.datetimeFinished.setValue(finish);
      component.datesForm.controls.datetimeFinished.markAsDirty();
      component.save();
      expect(save).not.toHaveBeenCalled();
      expect(component.dateError("datetimeFinished")).toContain("позже начала");
      expect(component.dateError("datetimeRegistrationEnds")).toContain("не позже окончания");
      expect(component.datesForm.controls.datetimeFinished.value).toBe(finish);
      expect(component.datesForm.dirty).toBe(true);
    },
  );
  it("разрешает регистрацию после старта вплоть до окончания программы", () => {
    const { component, save } = setup();
    component.settingsTab.set("dates");
    const registration = component.datesForm.controls.datetimeRegistrationEnds;
    registration.setValue(component.datesForm.controls.datetimeFinished.value);
    registration.markAsDirty();
    component.save();
    expect(component.dateError("datetimeRegistrationEnds")).toBeNull();
    expect(save).toHaveBeenCalledWith(1, "dates", {
      expectedUpdatedAt: program.updatedAt,
      confirmReopen: false,
      datetimeRegistrationEnds: new Date(program.datetimeFinished!).toISOString(),
    });
  });
  it("не требует полного календаря черновика", () => {
    const { component, state, save } = setup();
    state.program.set({ ...program, draft: true });
    component.resetForms();
    component.settingsTab.set("dates");
    component.datesForm.controls.datetimeFinished.setValue("");
    component.datesForm.controls.datetimeFinished.markAsDirty();
    component.save();
    expect(save).toHaveBeenCalledWith(1, "dates", {
      expectedUpdatedAt: program.updatedAt,
      confirmReopen: false,
      datetimeFinished: null,
    });
  });
  it("при повторном открытии срока решений называет именно прием решений и сохраняет значение при отмене", async () => {
    const { component, save } = setup();
    save.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({ status: 409, error: { code: "reopen_confirmation_required" } }),
      ),
    );
    component.settingsTab.set("dates");
    const deadline = component.datesForm.controls.datetimeProjectSubmissionEnds;
    deadline.setValue("2026-10-22T18:00");
    deadline.markAsDirty();
    component.save();
    expect(component.confirmation()?.title).toBe("Снова открыть прием решений?");
    expect(component.confirmation()?.label).toBe("Открыть прием");
    component.resolveConfirmation(false);
    await Promise.resolve();
    expect(deadline.value).toBe("2026-10-22T18:00");
    expect(deadline.dirty).toBe(true);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("после подтверждения повторно отправляет срок с серверным признаком подтверждения", async () => {
    const { component, save } = setup();
    save
      .mockReturnValueOnce(
        throwError(
          () =>
            new HttpErrorResponse({ status: 409, error: { code: "reopen_confirmation_required" } }),
        ),
      )
      .mockReturnValueOnce(of(program));
    component.settingsTab.set("dates");
    const deadline = component.datesForm.controls.datetimeProjectSubmissionEnds;
    deadline.setValue("2026-10-22T18:00");
    deadline.markAsDirty();
    component.save();
    component.resolveConfirmation(true);
    await Promise.resolve();
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith(1, "dates", {
      expectedUpdatedAt: program.updatedAt,
      confirmReopen: true,
      datetimeProjectSubmissionEnds: "2026-10-22T15:00:00.000Z",
    });
  });

  it("не называет повторное открытие регистрации открытием приема решений", () => {
    const { component, save } = setup();
    save.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({ status: 409, error: { code: "reopen_confirmation_required" } }),
      ),
    );
    component.settingsTab.set("dates");
    const deadline = component.datesForm.controls.datetimeRegistrationEnds;
    deadline.setValue("2026-10-22T18:00");
    deadline.markAsDirty();
    component.save();
    expect(component.confirmation()?.title).toBe("Снова открыть прием или оценивание?");
    expect(component.confirmation()?.label).toBe("Подтвердить и сохранить");
    component.resolveConfirmation(false);
  });
  it("сохраняет mobile URL и полный framing; 409 оставляет кадр для повторной попытки", () => {
    const { component, save } = setup();
    component.settingsTab.set("basic");
    const framing = {
      cover: { x: 20, y: 70, zoom: 2 },
      mobileCover: { x: 80, y: 30, zoom: 1.5 },
      logo: { x: 50, y: 50, zoom: 1 },
    };
    component.basicForm.controls.imageFraming.setValue(framing);
    component.basicForm.controls.imageFraming.markAsDirty();
    component.basicForm.controls.mobileCoverImageAddress.setValue("https://example.com/mobile.png");
    component.basicForm.controls.mobileCoverImageAddress.markAsDirty();
    save.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { code: "stale_settings", detail: "Кадр изменён другим организатором" },
          }),
      ),
    );
    component.save();
    expect(save).toHaveBeenCalledWith(1, "basic", {
      expectedUpdatedAt: program.updatedAt,
      confirmReopen: false,
      mobileCoverImageAddress: "https://example.com/mobile.png",
      imageFraming: framing,
    });
    expect(component.basicForm.controls.imageFraming.value).toEqual(framing);
    expect(component.basicForm.dirty).toBe(true);
  });
});

describe("Списки управления программой в DOM", () => {
  const queuedExport: ParticipantExportJob = { id: "participant-export", status: "queued" };
  const readyExport: ParticipantExportJob = { ...queuedExport, status: "ready" };

  async function setup(
    section = "participants",
    query = "",
    lastExport: ParticipantExportJob | null = null,
  ) {
    const uploaded = new Subject<{ url: string }>();
    const uploadFile = vi.fn<(file: File) => Observable<{ url: string }>>(() => uploaded);
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
        results: [
          {
            id: 1,
            userId: 51,
            registeredAt: "2026-10-01T12:00:00Z",
            name: "Анна",
            email: "anna@example.com",
            lastActivity: null as string | null | undefined,
          },
        ],
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
      error: signal<HttpErrorResponse | null>(null),
      evaluation: signal<ManagementEvaluation | null>(null),
      teamOpen: signal(false),
      teamPending: signal(false),
      teamError: signal(null),
      team: signal<ManagementTeam | null>(null),
      context: null as ManagementContext | null,
      api: {
        save: vi.fn(() => of(program)),
        returnToDraft: vi.fn<(id: number, version: string) => Observable<ProgramManagement>>(() =>
          of({ ...program, draft: true, updatedAt: "2026-10-30T10:01:00Z" }),
        ),
        previewProjectAction: vi.fn(() =>
          of({
            items: [],
            readyCount: 1,
            alreadySubmittedCount: 0,
            scoreCount: 0,
            removedAssignmentsCount: 0,
            canApply: true,
            previewToken: "proof",
          }),
        ),
        applyProjectAction: vi.fn(() => of({ changedCount: 1, alreadySubmittedCount: 0 })),
        exportProjects: vi.fn<() => Observable<Blob>>(() => new Subject<Blob>()),
        exportParticipants: vi.fn(() => of(queuedExport)),
        exportSelectedParticipants: vi.fn(() => of(queuedExport)),
        latestParticipantExport: vi.fn(() => of({ job: lastExport })),
        participantExportStatus: vi.fn(() => of(readyExport)),
        downloadParticipantExport: vi.fn(() => of(new Blob(["xlsx"]))),
        selection: vi.fn(() => of({ ids: Array.from({ length: 41 }, (_, i) => i + 1) })),
        previewParticipantRemoval: vi.fn<() => Observable<ParticipantRemovalPreview>>(() =>
          of({
            confirmationVersion: 2,
            previewToken: "proof",
            participantCount: 1,
            applications: [],
            assignmentsCount: 0,
            teamChanges: [],
          }),
        ),
        removeParticipants: vi.fn(() => of({ removed: 1 })),
      },
      retry: vi.fn(),
      openTeam: vi.fn(() => state.teamOpen.set(true)),
      closeTeam: vi.fn(() => state.teamOpen.set(false)),
      load: vi.fn((ctx: ManagementContext) => {
        state.context = ctx;
        state.participants.update(page => ({ ...page }));
        state.projects.update(page => (page ? { ...page } : page));
      }),
      select: vi.fn((row: ManagementProject) => state.selected.set(row)),
      clearSelection: vi.fn(() => state.selected.set(null)),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: "auth/login", component: LoginNavigationTarget },
          { path: "office/profile/:userId", component: ProfileNavigationTarget },
          {
            path: "office/program/:programId",
            children: [{ path: "management/:section", component: ProgramManagementComponent }],
          },
        ]),
        { provide: FileService, useValue: { uploadFile } },
        {
          provide: ApiService,
          useValue: { get: () => of({ seen: [] }), post: () => of({ seen: [] }) },
        },
        { provide: EvaluationUseCase, useValue: { workspace: () => of(evaluationWorkspace) } },
      ],
    }).overrideComponent(ProgramManagementComponent, {
      set: {
        providers: [
          { provide: ProgramManagementService, useValue: state },
          { provide: ProgramManagementUseCase, useValue: state.api },
        ],
      },
    });
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      `/office/program/1/management/${section}${query}`,
      ProgramManagementComponent,
    );
    const element = () => harness.routeNativeElement!;
    return { harness, component, state, project, element, uploadFile, uploaded };
  }

  it("ставит выгрузку по фильтрам в очередь и скачивает готовый Excel один раз", async () => {
    const { harness, component, state, element } = await setup(
      "participants",
      "?search=Анна&region_scope=selected&region=Москва",
    );
    const notify = vi.spyOn(TestBed.inject(SnackbarService), "info");
    vi.mocked(saveAs).mockClear();
    const pendingStatus = new Subject<ParticipantExportJob>();
    state.api.participantExportStatus.mockReturnValueOnce(pendingStatus);

    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    try {
      const exportButton = element().querySelector<HTMLButtonElement>(
        'button[data-program-guide="participants-export"]',
      )!;
      exportButton.click();
      harness.detectChanges();
      expect(state.api.exportParticipants).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ search: "Анна", regionScope: "selected", region: "Москва" }),
      );
      expect(notify).toHaveBeenCalledWith("Выгрузка поставлена в очередь");
      expect(exportButton.disabled).toBe(true);
      expect(element().textContent).toContain("Готовим Excel с участниками");
      component.exportParticipants();
      expect(state.api.exportParticipants).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(9000);
      expect(state.api.participantExportStatus).toHaveBeenCalledExactlyOnceWith(1, queuedExport.id);
      expect(saveAs).not.toHaveBeenCalled();
      pendingStatus.next(readyExport);
      pendingStatus.complete();
      harness.detectChanges();
      expect(state.api.downloadParticipantExport).toHaveBeenCalledExactlyOnceWith(
        1,
        readyExport.id,
      );
      expect(saveAs).toHaveBeenCalledExactlyOnceWith(
        expect.any(Blob),
        "program-1-participants.xlsx",
      );
      expect(element().textContent).toContain("Excel с участниками готов.");
      vi.advanceTimersByTime(9000);
      expect(state.api.participantExportStatus).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("останавливает проверку статуса при выходе с вкладки участников", async () => {
    const { harness, component, state } = await setup();
    const pendingStatus = new Subject<ParticipantExportJob>();
    state.api.participantExportStatus.mockReturnValueOnce(pendingStatus);

    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    try {
      component.exportSelectedParticipants();
      expect(state.api.exportSelectedParticipants).not.toHaveBeenCalled();
      component.selectedRows.set(new Set([1, 7]));
      component.exportSelectedParticipants();
      expect(state.api.exportSelectedParticipants).toHaveBeenCalledExactlyOnceWith(1, [1, 7]);
      vi.advanceTimersByTime(3000);
      expect(pendingStatus.observed).toBe(true);

      await harness.navigateByUrl("/office/program/1/management/projects");
      expect(pendingStatus.observed).toBe(false);
      pendingStatus.next(readyExport);
      vi.advanceTimersByTime(9000);
      expect(state.api.downloadParticipantExport).not.toHaveBeenCalled();
      expect(state.api.participantExportStatus).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("при повторном открытии предлагает скачать готовый Excel после клика", async () => {
    vi.mocked(saveAs).mockClear();
    const { state, element } = await setup("participants", "", readyExport);
    expect(state.api.latestParticipantExport).toHaveBeenCalledExactlyOnceWith(1);
    expect(state.api.downloadParticipantExport).not.toHaveBeenCalled();
    expect(saveAs).not.toHaveBeenCalled();
    const download = [...element().querySelectorAll("button")].find(
      button => button.textContent?.trim() === "Скачать Excel",
    )!;
    download.click();
    expect(state.api.downloadParticipantExport).toHaveBeenCalledExactlyOnceWith(1, readyExport.id);
    expect(saveAs).toHaveBeenCalledExactlyOnceWith(expect.any(Blob), "program-1-participants.xlsx");
  });

  it("отменяет следующее обновление статуса при уничтожении компонента", async () => {
    const { harness, component, state } = await setup();
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    try {
      component.exportParticipants();
      harness.fixture.destroy();
      vi.advanceTimersByTime(9000);
      expect(state.api.participantExportStatus).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("показывает ошибку подготовки и снова разрешает выгрузку", async () => {
    const { harness, component, state, element } = await setup();
    const detail = "Не удалось подготовить Excel. Повторите попытку.";
    state.api.latestParticipantExport.mockReturnValueOnce(of({ job: queuedExport }));
    state.api.participantExportStatus.mockReturnValueOnce(
      of({ ...queuedExport, status: "failed", detail }),
    );

    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    try {
      component.refreshParticipantExport();
      vi.advanceTimersByTime(3000);
      harness.detectChanges();
      expect(element().textContent).toContain(detail);
      expect(component.participantExportBusy()).toBe(false);
      expect(state.api.downloadParticipantExport).not.toHaveBeenCalled();
      vi.advanceTimersByTime(3000);
      expect(state.api.participantExportStatus).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("при конфликте показывает актуальную задачу без автоскачивания", async () => {
    const { harness, component, state, element } = await setup();
    const notify = vi.spyOn(TestBed.inject(SnackbarService), "info");
    state.api.exportParticipants.mockReturnValueOnce(
      throwError(
        () => new HttpErrorResponse({ status: 409, error: { code: "export_in_progress" } }),
      ),
    );
    state.api.latestParticipantExport.mockReturnValueOnce(of({ job: readyExport }));
    component.exportParticipants();
    harness.detectChanges();
    expect(notify).toHaveBeenCalledWith("Уже запущена выгрузка. Дождитесь ее завершения.");
    expect(state.api.latestParticipantExport).toHaveBeenCalledTimes(2);
    expect(element().textContent).toContain("Excel с участниками готов.");
    expect(state.api.downloadParticipantExport).not.toHaveBeenCalled();
  });

  it("при изменившемся составе сохраняет выбор и показывает ошибку вместо статуса очереди", async () => {
    const { component, state } = await setup();
    const notify = vi.spyOn(TestBed.inject(SnackbarService), "error");
    const detail = "Состав участников изменился. Обновите выбор.";
    state.api.exportSelectedParticipants.mockReturnValueOnce(
      throwError(
        () => new HttpErrorResponse({ status: 409, error: { code: "selection_changed", detail } }),
      ),
    );
    component.selectedRows.set(new Set([1, 7]));
    component.exportSelectedParticipants();
    expect(notify).toHaveBeenCalledWith(detail);
    expect(component.selectedRowIds()).toEqual([1, 7]);
    expect(state.api.latestParticipantExport).toHaveBeenCalledTimes(1);
    expect(component.participantExportBusy()).toBe(false);
  });

  it("показывает ответы участника и закрывает просмотр общим крестиком", async () => {
    const { component, harness } = await setup();
    component.participantAnswers.set({
      id: 1,
      userId: 51,
      name: "Анна",
      email: null,
      city: null,
      registeredAt: "2026-10-01T12:00:00Z",
      registrationAnswers: [{ label: "Вопрос", value: "Ответ" }],
    });
    harness.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    harness.detectChanges();
    const dialog = document.querySelector('[aria-labelledby="participant-answers-heading"]')!;
    expect(dialog.textContent).toContain("Ответ");
    const close = dialog.querySelector<HTMLButtonElement>('button[aria-label="Закрыть"]')!;
    expect(close).toBeTruthy();
    expect(dialog.querySelectorAll("button")).toHaveLength(1);
    close.click();
    harness.detectChanges();
    expect(component.participantAnswers()).toBeNull();
  });

  it("объясняет срок по умолчанию рядом с полем конкурсной программы", async () => {
    const { state, element, harness } = await setup("settings", "?tab=dates");
    const hint = () =>
      element().querySelector('label[for="datetimeProjectSubmissionEnds"] + app-tooltip');
    expect(element().textContent).toContain("UTC+3");
    expect(hint()).not.toBeNull();
    state.program.set({ ...program, isCompetitive: false });
    harness.detectChanges();
    expect(hint()).toBeNull();
  });

  it("возврат в черновик открывает подтверждение; отмена не отправляет запрос", async () => {
    const { component, state, element, harness } = await setup("settings", "?tab=basic");
    element().querySelector<HTMLButtonElement>('[aria-label="Действия программы"]')!.click();
    harness.detectChanges();
    const button = document.querySelector<HTMLButtonElement>(".management__settings-menu button")!;
    expect(button).toBeTruthy();
    button.click();
    harness.detectChanges();
    expect(component.confirmation()?.text).toContain("решения и оценки сохранятся");
    expect(state.api.returnToDraft).not.toHaveBeenCalled();
    component.resolveConfirmation(false);
    await Promise.resolve();
    expect(state.api.returnToDraft).not.toHaveBeenCalled();
    expect(state.program().draft).toBeFalsy();
  });

  it("подтверждение блокирует повтор и уход, затем показывает черновик и подготовку к запуску", async () => {
    const { component, state, element, harness } = await setup("settings", "?tab=basic");
    const response = new Subject<ProgramManagement>();
    state.api.returnToDraft.mockReturnValue(response);
    const action = component.returnToDraft();
    component.resolveConfirmation(true);
    await action;
    expect(state.api.returnToDraft).toHaveBeenCalledWith(program.id, program.updatedAt);
    expect(component.returningToDraft()).toBe(true);
    expect(component.basicForm.disabled).toBe(true);
    expect(await component.canLeave()).toBe(false);
    await component.returnToDraft();
    expect(state.api.returnToDraft).toHaveBeenCalledTimes(1);
    response.next({ ...program, draft: true, updatedAt: "2026-10-30T10:01:00Z" });
    response.complete();
    harness.detectChanges();
    expect(component.basicForm.enabled).toBe(true);
    expect(component.returningToDraft()).toBe(false);
    expect(state.program().draft).toBe(true);
    expect(element().textContent).toContain("Черновик · виден организаторам");
    expect(element().querySelector('a[href="/office/program/1/launch"]')?.textContent).toContain(
      "Обзор",
    );
    expect(element().querySelector('[aria-label="Действия программы"]')).toBeNull();
  });

  it("несохраненные настройки блокируют возврат без потери введенного текста", async () => {
    const { component, state, element, harness } = await setup("settings", "?tab=basic");
    component.basicForm.controls.name.setValue("Мое название");
    component.basicForm.controls.name.markAsDirty();
    harness.detectChanges();
    element().querySelector<HTMLButtonElement>('[aria-label="Действия программы"]')!.click();
    harness.detectChanges();
    const button = document.querySelector<HTMLButtonElement>(".management__settings-menu button")!;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-describedby")).toBe("program-publication-dirty");
    await component.returnToDraft();
    expect(component.confirmation()).toBeNull();
    expect(state.api.returnToDraft).not.toHaveBeenCalled();
    expect(component.basicForm.controls.name.value).toBe("Мое название");
    expect(component.basicForm.dirty).toBe(true);
  });

  it.each([409, 503])(
    "ошибка %s сохраняет опубликованный статус и разрешает повтор",
    async status => {
      const { component, state } = await setup("settings", "?tab=basic");
      const notifyError = vi.spyOn(TestBed.inject(SnackbarService), "error");
      state.api.returnToDraft.mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status,
              error: { detail: "Программа изменена другим организатором" },
            }),
        ),
      );
      const action = component.returnToDraft();
      component.resolveConfirmation(true);
      await action;
      expect(state.program().draft).toBeFalsy();
      if (status === 409) {
        expect(component.formError()).toBe("Программа изменена другим организатором");
        expect(notifyError).not.toHaveBeenCalled();
      } else {
        expect(component.formError()).toBeNull();
        expect(notifyError).toHaveBeenCalledExactlyOnceWith(
          "Не удалось выполнить запрос. Проверьте соединение и повторите попытку.",
        );
      }
      expect(component.returningToDraft()).toBe(false);
      expect(component.basicForm.enabled).toBe(true);
      expect(component.basicForm.controls.name.value).toBe(program.name);
    },
  );

  it("подтверждение после смены программы не вызывает действие для прежнего ID", async () => {
    const { component, state } = await setup("settings", "?tab=basic");
    const action = component.returnToDraft();
    state.program.set({ ...program, id: 2 });
    component.resolveConfirmation(true);
    await action;
    expect(state.api.returnToDraft).not.toHaveBeenCalled();
  });

  it("у черновика нет обратной кнопки", async () => {
    const { state, element, harness } = await setup("settings", "?tab=basic");
    state.program.set({ ...program, draft: true });
    harness.detectChanges();
    expect(element().querySelector('[aria-label="Действия программы"]')).toBeNull();
    expect(element().querySelector('a[href="/office/program/1/launch"]')?.textContent).toContain(
      "Обзор",
    );
  });

  it("действия строки используют ID связи, а массовая сдача включает другие страницы", async () => {
    const { component, project } = await setup("projects");
    expect(component.projectActions(project).map(a => a.id)).toEqual(
      expect.arrayContaining(["change_case", "detach", "submit"]),
    );
    component.openProjectAction("change_case", [project.id], project.name);
    expect(component.projectActionRequest()?.ids).toEqual([project.id]);
    component.selectedRows.set(new Set(Array.from({ length: 41 }, (_, i) => i + 1)));
    component.openProjectAction("submit");
    expect(component.projectActionRequest()?.ids).toHaveLength(41);
  });
  it("после открепления обновляет список и очищает выбор", async () => {
    const { component, state } = await setup("projects");
    const success = vi.spyOn(TestBed.inject(SnackbarService), "success");
    component.selectedRows.set(new Set([1]));
    component.projectActionCompleted({
      programId: 1,
      action: "detach",
      changedCount: 1,
      alreadySubmittedCount: 0,
    });
    expect(component.selectedRows().size).toBe(0);
    expect(component.projectActionRequest()).toBeNull();
    expect(state.retry).toHaveBeenCalledOnce();
    expect(success).toHaveBeenCalledExactlyOnceWith("Проект откреплен от программы.");
  });
  it.each([
    "?case_scope=selected&case_name=" + encodeURIComponent("Кейс №1") + "&offset=40",
    "?case_scope=without_case&offset=40",
  ])("после смены кейса последней строки возвращается на предыдущую страницу: %s", async query => {
    const { component, state } = await setup("projects", query);
    state.projects.update(page => page && { ...page, count: 41 });
    component.projectActionCompleted({
      programId: 1,
      action: "change_case",
      changedCount: 1,
      alreadySubmittedCount: 0,
    });
    await vi.waitFor(() => expect(state.context?.query.offset).toBe(20));
    expect(state.context?.query.caseScope).toBe(
      query.includes("without_case") ? "without_case" : "selected",
    );
  });
  it("после массовой сдачи исключает новые решения из фильтра несданных и исправляет страницу", async () => {
    const { component, state } = await setup("projects", "?submission=not_submitted&offset=40");
    state.projects.update(page => page && { ...page, count: 41 });
    component.projectActionCompleted({
      programId: 1,
      action: "submit",
      changedCount: 21,
      alreadySubmittedCount: 0,
    });
    await vi.waitFor(() => expect(state.context?.query.offset).toBe(0));
    expect(state.context?.query.submission).toBe("not_submitted");
  });
  it("без фильтра кейса смена кейса сохраняет текущую страницу", async () => {
    const { component, state } = await setup("projects", "?offset=40");
    state.projects.update(page => page && { ...page, count: 41 });
    component.projectActionCompleted({
      programId: 1,
      action: "change_case",
      changedCount: 1,
      alreadySubmittedCount: 0,
    });
    expect(state.context?.query.offset).toBe(40);
    expect(state.retry).toHaveBeenCalledOnce();
  });
  it("при401 показывает рабочую ссылку Войти с возвратом в текущую программу", async () => {
    const { state, harness, element } = await setup(
      "participants",
      "?activity=active&order=activity_desc",
    );
    state.error.set(new HttpErrorResponse({ status: 401 }));
    state.program.set(null as unknown as ProgramManagement);
    harness.detectChanges();
    const link = element().querySelector<HTMLButtonElement>("button.ui-button")!;
    expect(link.textContent?.trim()).toBe("Войти");
    expect(element().textContent).not.toContain("Повторить");
    link.click();
    await vi.waitFor(() => expect(harness.routeNativeElement?.textContent).toContain("Вход"));
    const router = TestBed.inject(Router);
    expect(router.parseUrl(router.url).queryParams["returnUrl"]).toBe(
      "/office/program/1/management/participants?activity=active&order=activity_desc",
    );
    expect(state.retry).not.toHaveBeenCalled();
  });
  it("ошибку сервера можно повторить обычной кнопкой", async () => {
    const { state, harness, element } = await setup();
    state.error.set(new HttpErrorResponse({ status: 500 }));
    harness.detectChanges();
    Array.from(element().querySelectorAll<HTMLButtonElement>("button.ui-button"))
      .find(button => button.textContent?.trim() === "Повторить")!
      .click();
    expect(state.retry).toHaveBeenCalledOnce();
  });

  function drag(type: string, files: File[] = [], types = ["Files"]): DragEvent {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", {
      value: { files, types, dropEffect: "none" },
    });
    return event as DragEvent;
  }

  it("открывает локальный предпросмотр и сохраняет обложку отдельно от черновика формы", async () => {
    const { component, harness, element, state, uploadFile, uploaded } = await setup(
      "settings",
      "?tab=basic",
    );
    const preview = () => element().querySelector(".management__branding")!;
    const input = element().querySelector<HTMLInputElement>(
      '[data-image-field="coverImageAddress"]',
    )!;
    const source = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:cover");
    const release = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    try {
      const name = component.basicForm.controls.name;
      name.setValue("Еще не сохранено");
      name.markAsDirty();
      const file = new File(["image"], "cover.png", { type: "image/png" });
      Object.defineProperty(input, "files", { value: [file] });
      input.dispatchEvent(new Event("change", { bubbles: true }));
      expect(component.imageEdit()?.source).toBe("blob:cover");
      expect(uploadFile).not.toHaveBeenCalled();
      component.imageReady.set(true);
      component.setImageFrame({ x: 50, y: 65, zoom: 1 });
      const url = "https://example.com/cover.png";
      state.api.save.mockReturnValue(
        of({
          ...program,
          coverImageAddress: url,
          imageFraming: { cover: { x: 50, y: 65, zoom: 1 } },
        }),
      );
      component.saveImage();
      expect(uploadFile).toHaveBeenCalledExactlyOnceWith(file);
      uploaded.next({ url });
      uploaded.complete();
      harness.detectChanges();
      expect(state.api.save).toHaveBeenCalledWith(1, "basic", {
        expectedUpdatedAt: program.updatedAt,
        coverImageAddress: url,
        imageFraming: {
          cover: { x: 50, y: 65, zoom: 1 },
          mobileCover: { x: 50, y: 50, zoom: 1 },
          logo: { x: 50, y: 50, zoom: 1 },
        },
      });
      expect(
        preview().querySelector<HTMLImageElement>(".management__branding-sample--mobile img")?.src,
      ).toBe(url);
      expect(name.value).toBe("Еще не сохранено");
      expect(name.dirty).toBe(true);
      expect(component.imageEdit()).toBeNull();
      expect(release).toHaveBeenCalledWith("blob:cover");
    } finally {
      source.mockRestore();
      release.mockRestore();
    }
  });

  it("показывает последнюю активность по Москве, а для null и старого API — прочерк", async () => {
    const { harness, state, element } = await setup();
    const participant = state.participants().results[0];
    state.participants.set({
      count: 3,
      results: [
        { ...participant, lastActivity: "2026-10-16T22:30:00Z" },
        { ...participant, id: 2, lastActivity: null },
        { ...participant, id: 3, lastActivity: undefined },
      ],
    });
    harness.detectChanges();
    const headings = element().querySelectorAll(".management__participants th");
    expect(headings).toHaveLength(8);
    expect(headings[6].textContent).toContain("Дата последней активности");
    expect(headings[5].textContent).toContain("Дата регистрации");
    const cells = element().querySelectorAll('td[data-label="Последняя активность"]');
    expect(Array.from(cells, cell => cell.textContent?.trim())).toEqual([
      "17.10.2026 01:30",
      "—",
      "—",
    ]);
    expect(cells[0].querySelector("time")?.getAttribute("datetime")).toBe("2026-10-16T22:30:00Z");
    expect(cells[1].querySelector("time")).toBeNull();
  });

  it("восстанавливает фильтры участников из URL и продолжает нумерацию со второй страницы", async () => {
    const { component, state, element, harness } = await setup(
      "participants",
      "?region_scope=selected&region=Москва&activity=period&activity_from=2026-10-01&activity_to=2026-10-19&offset=25",
    );
    expect(component.regionFilter.value).toBe("region:Москва");
    expect(component.activityFrom.value).toBe("2026-10-01");
    expect(state.context?.query.region).toBe("Москва");
    expect(state.context?.query.activityTo).toBe("2026-10-19");
    expect(element().querySelector('td[data-label="№"]')?.textContent?.trim()).toBe("26");
    state.participants.update(page => ({ ...page, totalCount: 42 }));
    harness.detectChanges();
    expect(element().querySelector(".management__list-heading h2")?.textContent).toBe(
      "Участники · 42",
    );
    expect(element().querySelector(".management__list-meta")?.textContent).toBe("Найдено: 1");
    component.activityFrom.setValue("2026-10-20");
    component.applyParticipantFilters();
    expect(component.participantFilterError()).toContain("не раньше");
  });

  it("фильтры редактируются в диалоге и применяются вместе, сохраняя поиск и сортировку", async () => {
    const { component, harness, state, element } = await setup(
      "participants",
      "?search=Анна&order=activity_asc&offset=20",
    );
    state.participants.set(Object.assign({}, state.participants(), { regionOptions: ["Москва"] }));
    component.openParticipantFilters();
    harness.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector(".management__filter-dialog")).toBeTruthy(),
    );
    const select = document.querySelector<HTMLSelectElement>(
      ".management__participant-filters select",
    )!;
    select.value = "region:Москва";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    component.activityFilter.setValue("active");
    harness.detectChanges();
    expect(state.context?.query.regionScope).toBe("all");
    expect(state.context?.query.activity).toBe("all");
    const submit = new Event("submit", { bubbles: true, cancelable: true });
    document.querySelector<HTMLFormElement>(".management__filter-dialog")!.dispatchEvent(submit);
    expect(submit.defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(state.context?.query.region).toBe("Москва"));
    expect(state.context?.query.activity).toBe("active");
    expect(state.context?.query.search).toBe("Анна");
    expect(state.context?.query.order).toBe("activity_asc");
    expect(state.context?.query.offset).toBe(0);
    expect(component.participantFilterCount()).toBe(2);
    expect(component.participantFiltersOpen()).toBe(false);
    expect(element().querySelector("th button")).toBeNull();
  });

  it("закрытие отменяет черновик, сброс применяется отдельно и не теряет сортировку", async () => {
    const { component, state } = await setup(
      "participants",
      "?region_scope=without_region&activity=inactive&order=activity_desc&search=Анна",
    );
    component.openParticipantFilters();
    component.regionFilter.setValue("region:Москва");
    component.activityFilter.setValue("period");
    component.applyParticipantFilters();
    expect(component.participantFilterError()).toContain("Укажите");
    expect(component.participantFiltersOpen()).toBe(true);
    component.closeParticipantFilters();
    component.openParticipantFilters();
    expect(component.regionFilter.value).toBe("without_region");
    expect(component.activityFilter.value).toBe("inactive");
    expect(component.participantFilterError()).toBeNull();
    component.resetParticipantFilterDraft();
    expect(state.context?.query.regionScope).toBe("without_region");
    expect(component.participantFilterCount()).toBe(2);
    component.applyParticipantFilters();
    await vi.waitFor(() => expect(state.context?.query.activity).toBe("all"));
    expect(state.context?.query.regionScope).toBe("all");
    expect(state.context?.query.order).toBe("activity_desc");
    expect(state.context?.query.search).toBe("Анна");
    expect(component.participantFilterCount()).toBe(0);
  });

  it("меню сортировки содержит два явных направления и не меняет порядок до выбора", async () => {
    const { component, harness, state, element } = await setup();
    expect(state.context?.query.order).toBe("activity_desc");
    expect(element().querySelector(".management__sort-trigger")?.getAttribute("aria-label")).toBe(
      "Сначала активные",
    );
    expect(element().querySelector(".management__sort-label--compact")?.textContent?.trim()).toBe(
      "Активные ↑",
    );
    element().querySelector<HTMLButtonElement>(".management__sort-trigger")!.click();
    harness.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelectorAll("[role=menuitemradio]").length).toBe(2),
    );
    const options = [...document.querySelectorAll<HTMLButtonElement>("[role=menuitemradio]")];
    expect(options.map(n => n.textContent?.trim())).toEqual([
      "Сначала активные",
      "Сначала неактивные",
    ]);
    expect(options.map(n => n.getAttribute("aria-checked"))).toEqual(["true", "false"]);
    expect(options[0].querySelector(".management__sort-check")).toBeTruthy();
    expect(options[1].querySelector(".management__sort-check")).toBeNull();
    options[1].click();
    await vi.waitFor(() => expect(state.context?.query.order).toBe("activity_asc"));
    expect(component.activitySortLabel()).toBe("Сначала неактивные");
    harness.detectChanges();
    expect(element().querySelector(".management__sort-trigger")?.getAttribute("aria-label")).toBe(
      "Сначала неактивные",
    );
    expect(element().querySelector(".management__sort-label--compact")?.textContent?.trim()).toBe(
      "Неактивные ↑",
    );
  });

  it("старая ссылка с порядком регистрации открывает новый порядок по умолчанию", async () => {
    const { component, state } = await setup("participants", "?order=registration");
    expect(state.context?.query.order).toBe("activity_desc");
    expect(component.activitySortLabel()).toBe("Сначала активные");
  });

  async function materialDialog() {
    const context = await setup("settings", "?tab=materials");
    context.component.editMaterial("new");
    context.harness.detectChanges();
    await vi.waitFor(() => expect(document.querySelector(".management__dialog form")).toBeTruthy());
    const form = document.querySelector<HTMLFormElement>(".management__dialog form")!;
    return { ...context, form };
  }

  it("крестик закрывает неизмененный материал через общий заголовок окна", async () => {
    const { component, form } = await materialDialog();
    const close = form.querySelector<HTMLButtonElement>(
      "app-dialog-header button[aria-label='Закрыть']",
    )!;
    expect(close).toBeTruthy();
    expect(form.querySelector("#management-dialog-title")?.textContent).toContain(
      "Добавить материал",
    );
    close.click();
    await vi.waitFor(() => expect(component.editingMaterial()).toBeNull());
  });

  it("крестик сохраняет защиту несохраненного материала", async () => {
    const { component, form } = await materialDialog();
    component.materialForm.controls.title.setValue("Мой материал");
    component.materialForm.markAsDirty();
    form.querySelector<HTMLButtonElement>("app-dialog-header button")!.click();
    expect(component.confirmation()?.title).toBe("Закрыть без сохранения?");
    component.resolveConfirmation(false);
    await vi.waitFor(() => expect(component.confirmation()).toBeNull());
    expect(component.editingMaterial()).toBe("new");
    expect(component.materialForm.controls.title.value).toBe("Мой материал");
    expect(component.materialForm.dirty).toBe(true);
  });

  it("режим ссылки скрывает загрузку и не меняет источник при drop файла", async () => {
    const { component, form, uploadFile } = await materialDialog();
    component.materialForm.controls.url.setValue("https://example.com/docs");
    expect(form.querySelector(".management__dropzone")).toBeNull();
    expect(form.querySelector("input[type=file]")).toBeNull();
    const over = drag("dragover");
    form.dispatchEvent(over);
    expect(over.dataTransfer?.dropEffect).toBe("none");
    const drop = drag("drop", [new File(["pdf"], "Презентация.pdf")]);
    form.dispatchEvent(drop);
    expect(drop.defaultPrevented).toBe(true);
    expect(uploadFile).not.toHaveBeenCalled();
    expect(component.materialForm.controls.mode.value).toBe("link");
    expect(component.materialForm.controls.url.value).toBe("https://example.com/docs");
    expect(component.materialDragActive()).toBe(false);
  });

  it("drop файла в режиме файла загружает материал; загрузка блокирует повторный drop и закрытие", async () => {
    const { component, harness, form, uploadFile, uploaded } = await materialDialog();
    component.materialForm.controls.mode.setValue("file");
    harness.detectChanges();
    component.materialForm.controls.title.setValue("Презентация");
    const file = new File(["pdf"], "Презентация.pdf", { type: "application/pdf" });
    const drop = drag("drop", [file]);
    form.dispatchEvent(drop);
    harness.detectChanges();
    expect(drop.defaultPrevented).toBe(true);
    expect(uploadFile).toHaveBeenCalledExactlyOnceWith(file);
    expect(component.materialForm.controls.mode.value).toBe("file");
    expect(form.textContent).toContain("Загружаем файл");
    expect(form.querySelector("fieldset")!.disabled).toBe(true);
    expect(form.querySelector<HTMLButtonElement>("app-dialog-header button")!.disabled).toBe(true);
    form.dispatchEvent(drag("drop", [new File(["other"], "other.pdf")]));
    await component.closeMaterial();
    expect(uploadFile).toHaveBeenCalledTimes(1);
    expect(component.editingMaterial()).toBe("new");
    uploaded.next({ url: "https://files.example.com/material.pdf" });
    uploaded.complete();
    harness.detectChanges();
    expect(component.materialForm.controls.file.value).toBe(
      "https://files.example.com/material.pdf",
    );
    expect(component.materialForm.controls.title.value).toBe("Презентация");
    expect(form.textContent).toContain("Презентация.pdf");
    expect(component.uploading()).toBeNull();
  });

  it("выбор через input использует ту же загрузку и позволяет выбрать тот же файл повторно", async () => {
    const { component, harness, form, uploadFile, uploaded } = await materialDialog();
    form.querySelector<HTMLInputElement>("input[type=radio][value=file]")!.click();
    harness.detectChanges();
    const file = new File(["doc"], "Положение.docx");
    const input = form.querySelector<HTMLInputElement>("input[type=file]")!;
    Object.defineProperty(input, "files", { value: [file] });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(uploadFile).toHaveBeenCalledExactlyOnceWith(file);
    expect(component.materialForm.controls.mode.value).toBe("file");
    expect(input.value).toBe("");
    uploaded.error(new HttpErrorResponse({ status: 413 }));
    expect(component.formError()).toContain("Файл слишком большой");
    expect(component.uploading()).toBeNull();
  });

  it("текст не загружается, несколько файлов отклоняются без потери введенной ссылки", async () => {
    const { component, form, uploadFile } = await materialDialog();
    component.materialForm.controls.url.setValue("https://example.com/docs");
    const text = drag("drop", [], ["text/plain"]);
    form.dispatchEvent(text);
    expect(text.defaultPrevented).toBe(false);
    component.materialForm.controls.mode.setValue("file");
    const multiple = drag("drop", [new File([], "a.pdf"), new File([], "b.pdf")]);
    form.dispatchEvent(multiple);
    expect(multiple.defaultPrevented).toBe(true);
    expect(uploadFile).not.toHaveBeenCalled();
    expect(component.formError()).toContain("по одному файлу");
    expect(component.materialForm.controls.mode.value).toBe("file");
    expect(component.materialForm.controls.url.value).toBe("https://example.com/docs");
  });

  it("ошибка замены сохраняет прежний файл и введённое название", async () => {
    const { component, form, uploadFile, uploaded } = await materialDialog();
    component.materialForm.patchValue({ title: "Мой материал", mode: "file", file: "old-file" });
    form.dispatchEvent(drag("drop", [new File([], "replacement.pdf")]));
    uploaded.error(new HttpErrorResponse({ status: 500 }));
    expect(component.materialForm.controls.title.value).toBe("Мой материал");
    expect(component.materialForm.controls.file.value).toBe("old-file");
    expect(component.formError()).toContain("повторите попытку");
    expect(component.uploading()).toBeNull();
    uploadFile.mockReturnValue(of({ url: "new-file" }));
    form.dispatchEvent(drag("drop", [new File([], "replacement.pdf")]));
    expect(component.materialForm.controls.file.value).toBe("new-file");
  });

  it("подсветка не пропадает при переходе между дочерними элементами и очищается при выходе", async () => {
    const { component, form } = await materialDialog();
    component.materialForm.controls.mode.setValue("file");
    form.dispatchEvent(drag("dragenter"));
    form.querySelector("h2")!.dispatchEvent(drag("dragenter"));
    form.querySelector("h2")!.dispatchEvent(drag("dragleave"));
    expect(component.materialDragActive()).toBe(true);
    const over = drag("dragover");
    form.dispatchEvent(over);
    expect(over.defaultPrevented).toBe(true);
    expect(over.dataTransfer?.dropEffect).toBe("copy");
    form.dispatchEvent(drag("dragleave"));
    expect(component.materialDragActive()).toBe(false);
  });

  it.each(["participants", "projects"])(
    "%s: отправка поиска сохраняет запрос и не перезагружает страницу",
    async section => {
      const { component, element } = await setup(section);
      component.search.setValue("Анна", { emitEvent: false });
      const event = new Event("submit", { bubbles: true, cancelable: true });
      element().querySelector<HTMLFormElement>("form.management__search")!.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      await vi.waitFor(() => expect(TestBed.inject(Router).url).toContain("search="));
      expect(component.search.value).toBe("Анна");
    },
  );

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
    const { harness, component, state } = await setup("projects");
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
    component.openProjectFilters();
    harness.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector<HTMLSelectElement>('[aria-label="Кейс"]')?.value).toBe(
        "case:Кейс №1",
      ),
    );
    expect(component.caseFilter.value).toBe("case:Кейс №1");
  });

  it("чекбокс выбирает несколько строк, меню проекта работает без одиночной плашки", async () => {
    const { harness, component, state, element } = await setup("projects");
    const checkbox = () =>
      element().querySelector<HTMLInputElement>('tbody input[type="checkbox"]')!;
    checkbox().click();
    harness.detectChanges();
    expect([...component.selectedRows()]).toEqual([11]);
    checkbox().click();
    harness.detectChanges();
    expect(component.selectedRows().size).toBe(0);
    const menu = element().querySelector<HTMLButtonElement>("app-row-actions button")!;
    const row = element().querySelector("tbody tr");
    menu.click();
    harness.detectChanges();
    expect(element().querySelector(".management__selection")).toBeNull();
    expect(element().querySelector("tbody tr")).toBe(row);
    const team = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(
      n => n.textContent?.trim() === "Посмотреть команду",
    )!;
    team.click();
    harness.detectChanges();
    expect(state.openTeam).toHaveBeenCalledOnce();
    expect(state.selected()?.id).toBe(11);
  });
  it("из списка участников можно открыть сертификаты этой программы", async () => {
    const { element } = await setup();
    const heading = element().querySelector(".management__list-heading");
    const link = heading?.querySelector<HTMLAnchorElement>(
      'a[href="/office/program/1/management/certificates"]',
    );
    expect(link?.textContent?.trim()).toBe("Сертификаты");
    expect(link?.nextElementSibling?.getAttribute("aria-label")).toBe(
      "Выгрузить участников в Excel",
    );
  });

  it("имя участника ведет в его профиль, а анкета остается отдельной командой", async () => {
    const { component, element } = await setup();
    const link = element().querySelector<HTMLAnchorElement>('td[data-label="Участник"] a')!;
    expect(link.getAttribute("href")).toBe("/office/profile/51");
    expect(component.state.context?.query.limit).toBe(20);
    link.click();
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe("/office/profile/51"));
  });
  it("сохраняет название программы и навигацию при открытии команды", async () => {
    const { state, harness, element } = await setup("projects");
    expect(element().querySelector(".program-heading h1")?.textContent).toContain(program.name);
    state.teamOpen.set(true);
    harness.detectChanges();
    expect(element().querySelector(".program-heading h1")?.textContent).toContain(program.name);
    expect(element().querySelector(".management__team")).not.toBeNull();
    state.teamOpen.set(false);
    harness.detectChanges();
    expect(element().querySelector(".management__team")).toBeNull();
  });
  it("фильтры наличия активности и сортировка сохраняются в URL и запросах всех страниц", async () => {
    const { component, state, element } = await setup("participants", "?activity=never&offset=20");
    expect(component.activityFilter.value).toBe("inactive");
    expect(state.context?.query.activity).toBe("inactive");
    component.openParticipantFilters();
    component.activityFilter.setValue("active");
    component.applyParticipantFilters();
    await vi.waitFor(() => expect(state.context?.query.activity).toBe("active"));
    component.sortByActivity("activity_desc");
    await vi.waitFor(() => expect(state.context?.query.order).toBe("activity_desc"));
    expect(state.context?.query.offset).toBe(0);
    expect(element().querySelector("th[aria-sort]")?.getAttribute("aria-sort")).toBe("descending");
    component.page(1);
    await vi.waitFor(() => expect(state.context?.query.offset).toBe(20));
    expect(state.context?.query.order).toBe("activity_desc");
    component.sortByActivity("activity_asc");
    await vi.waitFor(() => expect(state.context?.query.order).toBe("activity_asc"));
    expect(state.context?.query.activity).toBe("active");
    expect(element().querySelector("th[aria-sort]")?.getAttribute("aria-sort")).toBe("ascending");
  });
  it("выбор всех охватывает другие страницы, сохраняется при пагинации и очищается при смене фильтра", async () => {
    const { component, state, harness } = await setup();
    state.participants.update(p => ({ ...p, count: 41 }));
    harness.detectChanges();
    component.selectAllRows();
    expect(component.selectedRows().size).toBe(41);
    expect(state.api.selection).toHaveBeenCalledWith(
      1,
      "participants",
      expect.objectContaining({ limit: 20 }),
    );
    component.page(1);
    await vi.waitFor(() => expect(state.context?.query.offset).toBe(20));
    expect(component.selectedRows().size).toBe(41);
    await component.changeQuery({ search: "другой" });
    expect(component.selectedRows().size).toBe(0);
  });
  it("фильтры проектов применяются вместе, отмена сохраняет запрос и экспорт использует его", async () => {
    const { component, state, harness, element } = await setup(
      "projects",
      "?search=Проект&offset=20",
    );
    expect(element().querySelector("select")).toBeNull();
    expect(element().textContent).not.toContain("Проекты, связанные с этой программой");
    component.openProjectFilters();
    component.caseFilter.setValue("case:Кейс №1");
    component.submissionFilter.setValue("submitted");
    component.evaluationFilter.setValue("not_evaluated");
    expect(state.context?.query.caseScope).toBe("all");
    component.closeProjectFilters();
    component.openProjectFilters();
    expect(component.caseFilter.value).toBe("all");
    component.caseFilter.setValue("case:Кейс №1");
    component.submissionFilter.setValue("submitted");
    component.evaluationFilter.setValue("not_evaluated");
    component.applyProjectFilters();
    await vi.waitFor(() => expect(state.context?.query.caseName).toBe("Кейс №1"));
    expect(state.context?.query).toMatchObject({
      search: "Проект",
      offset: 0,
      submission: "submitted",
      evaluation: "not_evaluated",
    });
    expect(component.projectFilterCount()).toBe(3);
    harness.detectChanges();
    element().querySelector<HTMLButtonElement>('[aria-label="Выгрузить проекты в Excel"]')!.click();
    expect(state.api.exportProjects).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        caseName: "Кейс №1",
        submission: "submitted",
        evaluation: "not_evaluated",
      }),
    );
    component.openProjectFilters();
    component.resetProjectFilterDraft();
    expect(state.context?.query.caseName).toBe("Кейс №1");
    component.applyProjectFilters();
    await vi.waitFor(() => expect(state.context?.query.caseScope).toBe("all"));
    expect(component.projectFilterCount()).toBe(0);
  });

  it("ошибка выгрузки проектов понятна и позволяет повторить запрос", async () => {
    const { component, state, harness, element } = await setup("projects");
    const notifyError = vi.spyOn(TestBed.inject(SnackbarService), "error");
    state.api.exportProjects.mockReturnValueOnce(throwError(() => new Error("network")));
    component.exportProjects();
    harness.detectChanges();
    expect(notifyError).toHaveBeenCalledExactlyOnceWith(
      "Не удалось выгрузить проекты. Повторите попытку.",
    );
    expect(element().textContent).not.toContain("Не удалось выгрузить проекты");
    const button = element().querySelector<HTMLButtonElement>(
      '[aria-label="Выгрузить проекты в Excel"]',
    )!;
    expect(button.disabled).toBe(false);
    button.click();
    expect(state.api.exportProjects).toHaveBeenCalledTimes(2);
  });

  it("неконкурсная программа показывает только фильтр кейса и сбрасывает неприменимые значения", async () => {
    const { component, state, harness } = await setup(
      "projects",
      "?submission=submitted&evaluation=evaluated",
    );
    state.program.set({ ...program, isCompetitive: false });
    component.openProjectFilters();
    harness.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelectorAll(".management__filter-dialog select")).toHaveLength(1),
    );
    component.applyProjectFilters();
    await vi.waitFor(() =>
      expect(state.context?.query).toMatchObject({ submission: "all", evaluation: "all" }),
    );
    expect(component.projectFilterCount()).toBe(0);
  });

  it("сданный черновик виден и объяснен отдельно от отсутствия решения", async () => {
    const { component, state, harness, element } = await setup("projects");
    const row = state.projects()!.results[0];
    component.toggleRow(row);
    expect(component.assignmentReason()).toContain("без сданного решения");
    component.clearRows();
    const draft = { ...row, submitted: true, draft: true };
    state.projects.update(p => ({ ...p!, results: [draft] }));
    component.toggleRow(draft);
    harness.detectChanges();
    expect(element().querySelector("tbody .management__draft-badge")?.textContent).toContain(
      "Черновик заявки",
    );
    expect(element().querySelector(".management__bulk-summary")?.textContent).toContain(
      "Команде нужно завершить оформление заявки",
    );
    const action = [...element().querySelectorAll<HTMLButtonElement>("button")].find(
      n => n.textContent?.trim() === "Назначить экспертов",
    )!;
    expect(action.disabled).toBe(true);
    expect(action.getAttribute("aria-describedby")).toBe("project-assignment-reason");
    expect(action.getAttribute("title")).toBeNull();
  });

  it("в команде нет названия программы и каждое имя ведет в профиль", async () => {
    const { state, harness, element } = await setup("projects");
    state.team.set({
      projectId: 91,
      programLinkId: 11,
      name: "Проект",
      members: [
        { id: 51, name: "Участник", role: "Лидер" },
        { id: 52, name: "Второй", role: "Разработчик" },
      ],
    });
    state.teamOpen.set(true);
    harness.detectChanges();
    const drawer = element().querySelector(".management__team")!;
    expect(drawer.textContent).not.toContain(program.name);
    expect(
      [...drawer.querySelectorAll<HTMLAnchorElement>("a")].map(n => n.getAttribute("href")),
    ).toEqual(["/office/profile/51", "/office/profile/52"]);
  });

  it("фильтр оценивания восстанавливается из URL и передается в серверный запрос", async () => {
    const { component, state } = await setup("projects", "?evaluation=evaluated");
    expect(component.evaluationFilter.value).toBe("evaluated");
    expect(state.context?.query.evaluation).toBe("evaluated");
  });
  it("поздний ответ выбора всех после смены фильтра не восстанавливает старый выбор", async () => {
    const { component, state } = await setup();
    const delayed = new Subject<{ ids: number[] }>();
    state.api.selection.mockReturnValue(delayed);
    component.selectAllRows();
    await component.changeQuery({ search: "новая выборка" });
    delayed.next({ ids: [1, 2, 3] });
    delayed.complete();
    expect(component.selectedRows().size).toBe(0);
    expect(component.selectingRows()).toBe(false);
  });
  it("передает редактору назначений глобальный ID проекта вместо ID заявки", async () => {
    const { component, project } = await setup("projects");
    component.toggleRow({ ...project, submitted: true });
    component.assignSelectedProjects();
    expect(TestBed.inject(ProgramProjectAssignmentSelection).take(1)).toEqual([91]);
    expect(TestBed.inject(ProgramProjectAssignmentSelection).take(1)).toBeNull();
  });
  it("открывает вкладку распределения с назначениями выбранного эксперта", async () => {
    const { harness, element } = await setup("experts");
    element().querySelector<HTMLButtonElement>("app-expert-roster app-row-actions button")!.click();
    harness.detectChanges();
    const action = [...document.querySelectorAll<HTMLAnchorElement>('a[role="menuitem"]')].find(
      button => button.textContent?.trim() === "Посмотреть назначения",
    );
    expect(action).toBeDefined();
    action!.click();
    await harness.fixture.whenStable();
    harness.detectChanges();

    expect(TestBed.inject(Router).url).toBe(
      "/office/program/1/management/projects?tab=allocation&expert=11",
    );
    const active = element().querySelector(
      '[aria-label="Разделы оценивания"] [aria-current="page"]',
    );
    expect(active?.textContent?.trim()).toBe("Распределение");
    expect(element().textContent).toContain("Назначенный проект");
    expect(element().textContent).not.toContain("Свободный проект");
    expect(element().textContent).not.toContain("К экспертам");

    await harness.navigateByUrl("/office/program/1/management/experts", ProgramManagementComponent);
    await harness.navigateByUrl(
      "/office/program/1/management/projects?tab=allocation",
      ProgramManagementComponent,
    );
    expect(element().textContent).toContain("Свободный проект");
  });
  it("удаление запрашивает предварительный просмотр и отправляет его подписанное подтверждение", async () => {
    const { component, state } = await setup();
    component.selectedRows.set(new Set([1]));
    component.previewParticipantRemoval([1]);
    expect(state.api.removeParticipants).not.toHaveBeenCalled();
    expect(component.participantRemoval()?.preview.previewToken).toBe("proof");
    component.removeParticipants();
    expect(state.api.removeParticipants).toHaveBeenCalledWith(1, [1], "proof");
    expect(component.selectedRows().size).toBe(0);
    expect(state.retry).toHaveBeenCalledOnce();
  });
  it("подтверждение показывает команду заявки и сохраняемый исходный проект отдельно", async () => {
    const { component, state, harness, element } = await setup();
    state.api.previewParticipantRemoval.mockReturnValue(
      of({
        confirmationVersion: 2,
        previewToken: "proof",
        participantCount: 1,
        applications: [],
        assignmentsCount: 0,
        teamChanges: [
          {
            id: 11,
            projectId: 91,
            name: "Заявка команды",
            submitted: true,
            members: [{ id: 51, name: "Анна" }],
            invitationsCount: 1,
          },
        ],
      }),
    );
    component.previewParticipantRemoval([1]);
    harness.detectChanges();
    await vi.waitFor(() => {
      harness.detectChanges();
      expect(
        document.querySelector('[role="dialog"][aria-labelledby="participant-removal-title"]'),
      ).toBeTruthy();
    });
    const dialog = document.querySelector(
      '[role="dialog"][aria-labelledby="participant-removal-title"]',
    )!;
    expect(dialog.textContent).toContain("Команды исходных проектов на платформе сохранятся");
    expect(dialog.textContent).toContain("Заявка команды");
    expect(dialog.textContent).toContain("Анна");
    expect(dialog.textContent).toContain("Сохраненные оценки не изменятся");
    expect(state.api.removeParticipants).not.toHaveBeenCalled();
    expect(element().querySelector(".management__participants")).toBeTruthy();
  });
});
