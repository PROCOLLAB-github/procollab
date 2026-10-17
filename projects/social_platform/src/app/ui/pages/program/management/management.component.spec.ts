/** @format */

import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
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

  function drag(type: string, files: File[] = [], types = ["Files"]): DragEvent {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", {
      value: { files, types, dropEffect: "none" },
    });
    return event as DragEvent;
  }

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
    expect(headings).toHaveLength(5);
    expect(headings[4].textContent).toContain("Дата последней активности");
    const cells = element().querySelectorAll('td[data-label="Последняя активность"]');
    expect(Array.from(cells, cell => cell.textContent?.trim())).toEqual([
      "17.10.2026 01:30",
      "—",
      "—",
    ]);
    expect(cells[0].querySelector("time")?.getAttribute("datetime")).toBe("2026-10-16T22:30:00Z");
    expect(cells[1].querySelector("time")).toBeNull();
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
