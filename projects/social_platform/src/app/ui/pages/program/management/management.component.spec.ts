/** @format */

import { TestBed } from "@angular/core/testing";
import { Component, signal } from "@angular/core";
import { ActivatedRoute, Router, provideRouter } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { Observable, of, Subject, throwError } from "rxjs";
import { FileService } from "@corelib";
import {
  ManagementContext,
  ProgramManagementService,
} from "@api/program/facades/detail/program-management.service";
import {
  ManagementProject,
  ManagementProjectsPage,
  ProgramManagement,
  ParticipantRemovalPreview,
} from "@domain/program/program-management.model";
import { ProgramManagementComponent } from "./management.component";
import { ProgramProjectAssignmentSelection } from "@api/program/facades/detail/program-project-assignment-selection.service";

@Component({ template: "<h1>Профиль участника</h1>" })
class ProfileNavigationTarget {}
@Component({ template: "<h1>Вход</h1>" })
class LoginNavigationTarget {}

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
  it("сохраняет mobile URL и полный framing; 409 оставляет кадр для повторной попытки", () => {
    const { component, save } = setup();
    component.settingsTab.set("basic");
    const framing = {
      cover: { x: 20, y: 70, zoom: 2 },
      mobileCover: { x: 80, y: 30, zoom: 1.5 },
      logo: { x: 50, y: 50, zoom: 1 },
    };
    component.changeFraming(framing);
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
  async function setup(section = "participants", query = "") {
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
      evaluation: signal(null),
      teamOpen: signal(false),
      teamPending: signal(false),
      teamError: signal(null),
      team: signal(null),
      context: null as ManagementContext | null,
      api: {
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
    return { harness, component, state, project, element, uploadFile, uploaded };
  }

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
    element().querySelector<HTMLButtonElement>("button.ui-button")!.click();
    expect(state.retry).toHaveBeenCalledOnce();
  });

  function drag(type: string, files: File[] = [], types = ["Files"]): DragEvent {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", {
      value: { files, types, dropEffect: "none" },
    });
    return event as DragEvent;
  }

  it("замена и удаление изображений сбрасывают только зависимые кадры, включая mobile fallback", async () => {
    const { component, harness, element, uploaded } = await setup("settings", "?tab=basic");
    const framing = {
      cover: { x: 20, y: 30, zoom: 2 },
      mobileCover: { x: 80, y: 70, zoom: 3 },
      logo: { x: 40, y: 60, zoom: 1.5 },
    };
    component.basicForm.controls.mobileCoverImageAddress.setValue("https://example.com/mobile.png");
    component.changeFraming(framing);
    const input = element().querySelector<HTMLInputElement>(
      'input[type=file][aria-describedby="program-image-hint-coverImageAddress"]',
    )!;
    Object.defineProperty(input, "files", {
      value: [new File(["image"], "cover.png", { type: "image/png" })],
    });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    uploaded.next({ url: "https://example.com/cover.png" });
    uploaded.complete();
    harness.detectChanges();
    expect(component.basicForm.controls.imageFraming.value).toEqual({
      ...framing,
      cover: { x: 50, y: 50, zoom: 1 },
    });
    component.clearImage("mobileCoverImageAddress");
    expect(component.basicForm.controls.imageFraming.value.mobileCover).toEqual({
      x: 50,
      y: 50,
      zoom: 1,
    });
    component.changeFraming(framing);
    component.clearImage("coverImageAddress");
    expect(component.basicForm.controls.imageFraming.value).toEqual({
      ...framing,
      cover: { x: 50, y: 50, zoom: 1 },
      mobileCover: { x: 50, y: 50, zoom: 1 },
    });
    component.clearImage("imageAddress");
    expect(component.basicForm.controls.imageFraming.value.logo).toEqual({ x: 50, y: 50, zoom: 1 });
    component.resetForms();
    expect(component.basicForm.pristine).toBe(true);
    expect(component.basicForm.controls.mobileCoverImageAddress.value).toBe("");
  });

  it("предпросмотр использует несохранённую загрузку; переключение не сохраняет и не меняет dirty", async () => {
    const { component, harness, element, state, uploaded } = await setup("settings", "?tab=basic");
    const save = vi.spyOn(component, "save");
    const preview = () => element().querySelector("app-program-branding-preview")!;
    const draftCover = () =>
      preview().querySelector<HTMLImageElement>(".branding-preview__cover-image")!;
    preview().querySelectorAll<HTMLButtonElement>("button")[1].click();
    harness.detectChanges();
    expect(component.basicForm.pristine).toBe(true);
    expect(save).not.toHaveBeenCalled();
    const input = element().querySelector<HTMLInputElement>(".management__image input[type=file]")!;
    Object.defineProperty(input, "files", {
      value: [new File(["image"], "cover.png", { type: "image/png" })],
    });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    harness.detectChanges();
    expect(preview().textContent).toContain("Загружаем изображение");
    uploaded.next({ url: "https://example.com/unsaved-cover.png" });
    uploaded.complete();
    harness.detectChanges();
    expect(draftCover().src).toBe("https://example.com/unsaved-cover.png");
    expect(component.basicForm.dirty).toBe(true);
    expect(state.program().coverImageAddress).not.toBe("https://example.com/unsaved-cover.png");
    expect(save).not.toHaveBeenCalled();
    expect(preview().textContent).toContain("экрана 360 px");
    component.resetForms();
    harness.detectChanges();
    expect(draftCover().getAttribute("src")).toContain("/cover.png");
    expect(component.basicForm.pristine).toBe(true);
    expect(element().textContent).toContain("Высоту можно выбрать любую");
    expect(element().textContent).not.toContain("Высота — по содержимому");
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
    const { component, state, element } = await setup(
      "participants",
      "?region_scope=selected&region=Москва&activity=period&activity_from=2026-10-01&activity_to=2026-10-19&offset=25",
    );
    expect(component.regionFilter.value).toBe("region:Москва");
    expect(component.activityFrom.value).toBe("2026-10-01");
    expect(state.context?.query.region).toBe("Москва");
    expect(state.context?.query.activityTo).toBe("2026-10-19");
    expect(element().querySelector('td[data-label="№"]')?.textContent?.trim()).toBe("26");
    expect(element().textContent).toContain("Всего участников:");
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
    expect(state.context?.query.order).toBe("registration");
    element().querySelector<HTMLButtonElement>(".management__sort-trigger")!.click();
    harness.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelectorAll("[role=menuitemradio]").length).toBe(2),
    );
    const options = [...document.querySelectorAll<HTMLButtonElement>("[role=menuitemradio]")];
    expect(options.map(n => n.textContent?.trim())).toEqual([
      "Сначала недавно активные",
      "Сначала давно активные",
    ]);
    expect(options.map(n => n.getAttribute("aria-checked"))).toEqual(["false", "false"]);
    options[1].click();
    await vi.waitFor(() => expect(state.context?.query.order).toBe("activity_asc"));
    expect(component.activitySortLabel()).toBe("Сначала давно активные");
  });

  async function materialDialog() {
    const context = await setup("settings", "?tab=materials");
    context.component.editMaterial("new");
    context.harness.detectChanges();
    await vi.waitFor(() => expect(document.querySelector(".management__dialog form")).toBeTruthy());
    const form = document.querySelector<HTMLFormElement>(".management__dialog form")!;
    return { ...context, form };
  }

  it("drop файла в режиме ссылки переключает источник; загрузка блокирует повторный drop и закрытие", async () => {
    const { component, harness, form, uploadFile, uploaded } = await materialDialog();
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
    const { component, form, uploadFile, uploaded } = await materialDialog();
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

  it("текст не загружается, несколько файлов отклоняются без смены источника и потери ссылки", async () => {
    const { component, form, uploadFile } = await materialDialog();
    component.materialForm.controls.url.setValue("https://example.com/docs");
    const text = drag("drop", [], ["text/plain"]);
    form.dispatchEvent(text);
    expect(text.defaultPrevented).toBe(false);
    const multiple = drag("drop", [new File([], "a.pdf"), new File([], "b.pdf")]);
    form.dispatchEvent(multiple);
    expect(multiple.defaultPrevented).toBe(true);
    expect(uploadFile).not.toHaveBeenCalled();
    expect(component.formError()).toContain("по одному файлу");
    expect(component.materialForm.controls.mode.value).toBe("link");
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
  it("имя участника ведет в его профиль, а анкета остается отдельной командой", async () => {
    const { component, element } = await setup();
    const link = element().querySelector<HTMLAnchorElement>('td[data-label="Участник"] a')!;
    expect(link.getAttribute("href")).toBe("/office/profile/51");
    expect(component.state.context?.query.limit).toBe(20);
    link.click();
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe("/office/profile/51"));
  });
  it("скрывает название программы при открытии команды и восстанавливает после закрытия", async () => {
    const { state, harness, element } = await setup("projects");
    expect(element().querySelector(".management__heading p")?.textContent).toContain(program.name);
    state.teamOpen.set(true);
    harness.detectChanges();
    expect(element().querySelector(".management__heading p")).toBeNull();
    state.teamOpen.set(false);
    harness.detectChanges();
    expect(element().querySelector(".management__heading p")?.textContent).toContain(program.name);
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
