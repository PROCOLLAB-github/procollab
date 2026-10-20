/** @format */
import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { ProgramRegistrationUseCase } from "@api/program/use-cases/program-registration.use-case";
import {
  RegistrationField,
  RegistrationSettings,
} from "@domain/program/program-registration.model";
import { ManagementRegistrationComponent } from "./registration.component";
const field: RegistrationField = {
  id: "f" + "a".repeat(32),
  label: "Вуз",
  type: "select",
  helpText: "",
  required: true,
  source: "own",
  options: ["Первый"],
  allowOther: false,
};
const snapshot: RegistrationSettings = {
  draft: { mode: "native", fields: [field] },
  published: null,
  revision: 2,
  publishedVersion: 0,
  publishedAt: null,
  externalStatus: "not_connected",
  externalUrl: "",
  connectionComment: "",
  connectionWebsiteUrl: "",
  connectionContact: "",
  answeredFieldIds: [],
  link: null,
};
function setup(answered = false) {
  const data = structuredClone(snapshot);
  if (answered) data.answeredFieldIds = [field.id];
  const api = {
    settings: vi.fn(() => of(data)),
    save: vi.fn(() => of(data)),
    importOptions: vi.fn(),
    connect: vi.fn(),
  };
  TestBed.configureTestingModule({ imports: [ManagementRegistrationComponent] });
  TestBed.overrideComponent(ManagementRegistrationComponent, {
    set: { providers: [{ provide: ProgramRegistrationUseCase, useValue: api }] },
  });
  const fixture = TestBed.createComponent(ManagementRegistrationComponent);
  fixture.componentRef.setInput("programId", 42);
  fixture.componentRef.setInput("confirmDiscard", () => Promise.resolve(true));
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, api };
}
describe("Редактор анкеты регистрации", () => {
  it("крестик убирает поле без ответов только из черновика", () => {
    const { component } = setup();
    component.remove(field);
    expect(component.draft().fields).toHaveLength(0);
    expect(component.snapshot()?.draft.fields).toHaveLength(1);
    expect(component.dirty()).toBe(true);
  });
  it("поле с ответами сначала предлагает архивирование", () => {
    const { component } = setup(true);
    component.remove(field);
    expect(component.dialog()).toBe("archive");
    expect(component.draft().fields).toHaveLength(1);
    component.removeNow();
    expect(component.draft().fields).toHaveLength(0);
  });
  it("отмена изменений восстанавливает поле", () => {
    const { component } = setup();
    component.remove(field);
    component.discard();
    expect(component.draft().fields).toHaveLength(1);
    expect(component.dirty()).toBe(false);
  });
  it("предпросмотр ничего не публикует и отключает поля", () => {
    const { component, api } = setup();
    component.preview();
    expect(component.previewGroup.disabled).toBe(true);
    expect(api.save).not.toHaveBeenCalled();
  });
  it("запрос принимает сайт без необязательных деталей и передаёт контакт отдельно", () => {
    const { component, api } = setup();
    component.setMode("external");
    component.open("connection");
    component.connection.controls.url.setValue("https://event.example.test");
    expect(component.connection.valid).toBe(true);
    component.connection.controls.contact.setValue("@event_organizer");
    api.connect.mockReturnValue(of({ ...snapshot, externalStatus: "requested" }));
    component.requestConnection();
    expect(api.connect).toHaveBeenCalledWith(
      42,
      "https://event.example.test",
      "",
      "@event_organizer",
    );
    expect(component.message()).toContain("Мы свяжемся с вами в ближайшее время");
    expect(component.dialog()).toBeNull();
  });
  it("ошибка импорта сохраняет старые варианты", () => {
    const { component, api } = setup();
    component.edit(field);
    api.importOptions.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: ["Неверный файл"] })),
    );
    component.upload({
      target: { files: [new File(["bad"], "bad.xlsx")], value: "" },
    } as unknown as Event);
    expect(component.editor.controls.options.value).toBe("Первый");
    expect(component.dialogError()).toBeTruthy();
  });
  it("список проверяется до применения и удаляет пустые строки и повторы", () => {
    const { component } = setup();
    component.edit(field);
    component.editor.controls.options.setValue("Первый\n\nПервый\nВторой");
    component.pastePreview();
    expect(component.importResult()).toEqual({
      options: ["Первый", "Второй"],
      blanks: 1,
      duplicates: 1,
    });
    component.applyImport();
    expect(component.editor.controls.options.value).toBe("Первый\nВторой");
  });
  it("поддерживает порядок полей и не отправляет устаревшую ревизию неявно", () => {
    const { component, api } = setup();
    component.edit(null);
    component.editor.patchValue({ label: "Телефон", position: 1 });
    component.saveField();
    expect(component.draft().fields[0].label).toBe("Телефон");
    component.save(true);
    expect(api.save).toHaveBeenCalledWith(42, 2, expect.objectContaining({ mode: "native" }), true);
  });
});
