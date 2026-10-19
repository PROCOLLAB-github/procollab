/** @format */
import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { of, Subject, throwError } from "rxjs";
import { FileService } from "@corelib";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import { ManagementProjectForm } from "@domain/program/program-project-form.model";
import { ManagementProjectFormComponent } from "./project-form.component";

const initial = (): ManagementProjectForm => ({
  updatedAt: "2026-10-17T10:00:00Z",
  revision: "original",
  hasProjects: true,
  cases: [{ name: "Кейс А", projectsCount: 2 }],
  fields: [],
  supportedTypes: ["text", "textarea", "select", "file"],
});
describe("Organizer cases and common fields", () => {
  const api = { projectForm: vi.fn(), saveProjectForm: vi.fn() };
  async function setup() {
    const pending = new Subject<ManagementProjectForm>();
    api.projectForm.mockReset().mockReturnValue(pending);
    api.saveProjectForm.mockReset();
    await TestBed.configureTestingModule({
      imports: [ManagementProjectFormComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProgramManagementUseCase, useValue: api },
        { provide: FileService, useValue: {} },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ManagementProjectFormComponent);
    fixture.componentRef.setInput("programId", 8);
    fixture.componentRef.setInput("confirmDiscard", () => Promise.resolve(true));
    await fixture.whenStable();
    return { fixture, component: fixture.componentInstance, pending };
  }
  it("loads asynchronously, protects used case and saves the entire explicit draft", async () => {
    const { fixture, component, pending } = await setup();
    expect(fixture.nativeElement.textContent).toContain("Загружаем кейсы");
    pending.next(initial());
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector(".project-form__row button").disabled).toBe(true);
    component.editCase();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector("#case-name");
    input.value = "Кейс Б";
    input.dispatchEvent(new Event("input"));
    const event = new Event("submit", { bubbles: true, cancelable: true });
    fixture.nativeElement.querySelector(".project-form__case-editor").dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(component.cases().map(c => c.name)).toEqual(["Кейс А", "Кейс Б"]);
    component.editField("new");
    component.editor.controls.label.setValue("Прототип");
    component.editor.controls.isRequired.setValue(true);
    component.saveField();
    expect(component.dirty()).toBe(true);
    expect(api.saveProjectForm).not.toHaveBeenCalled();
    const saved = {
      ...initial(),
      updatedAt: "2026-10-17T12:00:00Z",
      revision: "new",
      cases: component.cases(),
      fields: component.fields().map(f => ({ ...f, id: 11, name: "server_name" })),
    };
    api.saveProjectForm.mockReturnValue(of(saved));
    component.save();
    expect(api.saveProjectForm).toHaveBeenCalledWith(
      8,
      expect.objectContaining({
        expectedRevision: "original",
        cases: ["Кейс А", "Кейс Б"],
        fields: [expect.objectContaining({ id: null, isRequired: true, fieldType: "text" })],
      }),
    );
    expect(component.dirty()).toBe(false);
    expect(component.saved()).toBe(true);
  });
  it("retains draft after conflict; cancelled refresh does not overwrite it", async () => {
    const { fixture, component, pending } = await setup();
    pending.next(initial());
    await fixture.whenStable();
    component.editCase();
    component.caseName.setValue("Новый");
    component.saveCase();
    api.saveProjectForm.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    component.save();
    expect(component.conflict()).toBe(true);
    expect(component.cases().length).toBe(2);
    fixture.componentRef.setInput("confirmDiscard", () => Promise.resolve(false));
    await component.reload();
    expect(api.projectForm).toHaveBeenCalledTimes(1);
    expect(component.dirty()).toBe(true);
  });
  it("preview uses the same required controls; an empty draft succeeds locally", async () => {
    const { fixture, component, pending } = await setup();
    pending.next(initial());
    await fixture.whenStable();
    component.openPreview();
    component.previewSubmit();
    expect(component.previewInvalid()).toBe(true);
    expect(component.previewForm.get("case")?.hasError("required")).toBe(true);
    component.previewDraft();
    expect(component.previewInvalid()).toBe(false);
    expect(component.previewMessage()).toContain("Черновик сохранен");
    expect(api.saveProjectForm).not.toHaveBeenCalled();
    component.previewForm.get("case")?.setValue("Кейс А");
    component.previewSubmit();
    expect(component.previewInvalid()).toBe(false);
  });
  it("rejects duplicate case names and preserves special legacy settings", async () => {
    const { fixture, component, pending } = await setup();
    const data = initial();
    data.fields = [
      {
        id: 5,
        name: "legacy",
        label: "Выбор",
        fieldType: "radio",
        isRequired: true,
        helpText: "",
        options: ["Один", "Два"],
        answersCount: 1,
        editableType: false,
      },
    ];
    pending.next(data);
    await fixture.whenStable();
    component.editCase();
    component.caseName.setValue("КЕЙС А");
    component.saveCase();
    expect(component.caseError()).toBeTruthy();
    component.editField(data.fields[0]);
    expect(component.editor.controls.fieldType.disabled).toBe(true);
    expect(component.editor.controls.isRequired.disabled).toBe(true);
    component.editor.controls.label.setValue("Новая подпись");
    component.saveField();
    expect(component.fields()[0]).toMatchObject({
      name: "legacy",
      fieldType: "radio",
      options: ["Один", "Два"],
      label: "Новая подпись",
    });
  });
});
