/** @format */

import { DestroyRef, signal } from "@angular/core";
import { FormControl } from "@angular/forms";
import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { UpdateFormUseCase } from "../../use-cases/update-form.use-case";
import { ProjectFormAutosaveService } from "./project-form-autosave.service";
import { SnackbarService } from "@domain/shared/snackbar.service";

const QUEUE_KEY = "project-autosave-queue";
const networkError = { ok: false, error: { kind: "network", status: 0 } };

describe("ProjectFormAutosaveService", () => {
  let service: ProjectFormAutosaveService;
  let update: ReturnType<typeof vi.fn>;
  let errorFeedback: ReturnType<typeof vi.fn>;
  const projectId = signal<number | null>(31);

  beforeEach(() => {
    localStorage.removeItem(QUEUE_KEY);
    projectId.set(31);
    update = vi.fn().mockReturnValue(of({ ok: true }));
    errorFeedback = vi.fn();
    // ActivatedRoute намеренно не предоставляется: autosave не зависит от дерева маршрутов.
    TestBed.configureTestingModule({
      providers: [
        ProjectFormAutosaveService,
        { provide: UpdateFormUseCase, useValue: { execute: update } },
        { provide: SnackbarService, useValue: { error: errorFeedback } },
      ],
    });
    service = TestBed.inject(ProjectFormAutosaveService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.removeItem(QUEUE_KEY);
  });

  function bind(field: "presentationAddress" | "coverImageAddress" = "presentationAddress") {
    const control = new FormControl<string | null>("https://example.test/file");
    service.bindDraftCleanupAutosave(control, field, TestBed.inject(DestroyRef), projectId);
    return control;
  }

  it.each(["presentationAddress", "coverImageAddress"] as const)(
    "сохраняет очистку %s ровно один раз в проект 31",
    field => {
      bind(field).setValue("");
      expect(update).toHaveBeenCalledExactlyOnceWith({
        id: 31,
        data: { [field]: "", draft: true },
      });
    },
  );

  it.each([null, undefined, NaN, 0, -1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1, "31"])(
    "не отправляет и не сохраняет в очередь недопустимый ID %s",
    id => {
      projectId.set(id as number | null);
      update.mockReturnValue(of(networkError));
      bind().setValue("");
      expect(update).not.toHaveBeenCalled();
      expect(localStorage.getItem(QUEUE_KEY)).toBeNull();
    },
  );

  it("не считает null и новый URL командой очистки", () => {
    const control = bind();
    control.setValue(null);
    control.setValue("https://example.test/new-file");
    expect(update).not.toHaveBeenCalled();
  });

  it("не отправляет запрос при заполнении пустого control без событий", () => {
    bind().setValue("", { emitEvent: false });
    expect(update).not.toHaveBeenCalled();
  });

  it("при network сохраняет реальный ID и повторяет его после перехода на другой проект", () => {
    const control = bind();
    update.mockReturnValueOnce(of(networkError));
    control.setValue("");
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY)!)).toEqual([
      { projectId: 31, field: "presentationAddress", value: "" },
    ]);
    expect(errorFeedback).toHaveBeenCalledWith(expect.stringContaining("ещё не сохранена"));
    projectId.set(32);
    control.setValue("https://example.test/project-32", { emitEvent: false });
    control.setValue("");
    window.dispatchEvent(new Event("online"));
    expect(update.mock.calls.map(([command]) => command.id)).toEqual([31, 32, 31]);
    expect(localStorage.getItem(QUEUE_KEY)).toBeNull();
  });

  it("сохраняет адрес ожидающего события при смене проекта внутри concatMap", () => {
    const pending = new Subject<any>();
    update.mockReturnValueOnce(pending);
    const control = bind();
    control.setValue("");
    control.setValue("");
    projectId.set(32);
    pending.next({ ok: true });
    pending.complete();
    expect(update.mock.calls.map(([command]) => command.id)).toEqual([31, 31]);
  });

  it("при повторной сетевой ошибке сохраняет очередь без дублей", () => {
    update.mockReturnValue(of(networkError));
    const control = bind();
    control.setValue("");
    control.setValue("");
    window.dispatchEvent(new Event("online"));
    expect(JSON.parse(localStorage.getItem(QUEUE_KEY)!)).toEqual([
      { projectId: 31, field: "presentationAddress", value: "" },
    ]);
  });

  it("не скрывает ошибку сохранения, отличную от network", () => {
    update.mockReturnValue(of({ ok: false, error: { kind: "unknown" } }));
    bind().setValue("");
    expect(errorFeedback).toHaveBeenCalledWith(expect.stringContaining("сохранение черновика"));
    expect(localStorage.getItem(QUEUE_KEY)).toBeNull();
  });

  it("отбрасывает повреждённые старые записи, сохраняя допустимые поля и строковые значения", () => {
    localStorage.setItem(
      QUEUE_KEY,
      JSON.stringify([
        null,
        7,
        {},
        [],
        ...[null, "31", 0, -1, 1.1, Number.MAX_SAFE_INTEGER + 1].map(id => ({
          projectId: id,
          field: "presentationAddress",
          value: "",
        })),
        { projectId: 31, field: "name", value: "" },
        { projectId: 31, field: "coverImageAddress", value: false },
        { projectId: 31, field: "coverImageAddress", value: "" },
        { projectId: 32, field: "presentationAddress", value: "https://example.test/file" },
      ]),
    );
    window.dispatchEvent(new Event("online"));
    expect(update.mock.calls.map(([command]) => command)).toEqual([
      { id: 31, data: { coverImageAddress: "", draft: true } },
      { id: 32, data: { presentationAddress: "https://example.test/file", draft: true } },
    ]);
    expect(localStorage.getItem(QUEUE_KEY)).toBeNull();
  });

  it.each(["broken json", "{}", "null", "42"])("не отправляет запрос для очереди %s", stored => {
    localStorage.setItem(QUEUE_KEY, stored);
    window.dispatchEvent(new Event("online"));
    expect(update).not.toHaveBeenCalled();
  });

  it("проверяет старую очередь и при запуске уже online", () => {
    TestBed.resetTestingModule();
    localStorage.setItem(
      QUEUE_KEY,
      JSON.stringify([
        { projectId: null, field: "presentationAddress", value: "" },
        { projectId: 31, field: "presentationAddress", value: "" },
      ]),
    );
    TestBed.configureTestingModule({
      providers: [
        { provide: UpdateFormUseCase, useValue: { execute: update } },
        { provide: SnackbarService, useValue: { error: errorFeedback } },
      ],
    });
    TestBed.inject(ProjectFormAutosaveService);
    expect(update).toHaveBeenCalledExactlyOnceWith({
      id: 31,
      data: { presentationAddress: "", draft: true },
    });
  });

  it("после destroy отменяет ожидающие события и не обрабатывает online", () => {
    const pending = new Subject<any>();
    update.mockReturnValueOnce(pending);
    const control = bind();
    control.setValue("");
    control.setValue("");
    TestBed.resetTestingModule();
    pending.next(networkError);
    pending.complete();
    control.setValue("");
    window.dispatchEvent(new Event("online"));
    expect(update).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(QUEUE_KEY)).toBeNull();
  });
});
