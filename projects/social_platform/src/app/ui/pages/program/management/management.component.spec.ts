/** @format */

import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { of, Subject, throwError } from "rxjs";
import { FileService } from "@corelib";
import { ProgramManagementService } from "@api/program/facades/detail/program-management.service";
import { ProgramManagement } from "@domain/program/program-management.model";
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
        { provide: Router, useValue: { events: new Subject(), navigate: vi.fn() } },
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
