/** @format */
import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HttpErrorResponse } from "@angular/common/http";
import { of, Subject, throwError } from "rxjs";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import { ManagementCriteria } from "@domain/program/program-criteria.model";
import { ManagementCriteriaComponent } from "./criteria.component";

const initial = (): ManagementCriteria => ({
  updatedAt: "2026-10-18T00:00:00Z",
  revision: "first",
  locked: false,
  supportedTypes: ["int", "bool", "str"],
  criteria: [
    {
      id: 1,
      name: "Качество",
      description: "Насколько продумано решение",
      type: "int",
      minValue: 0,
      maxValue: 10,
    },
  ],
});
describe("Organizer evaluation criteria", () => {
  const api = { criteria: vi.fn(), saveCriteria: vi.fn() };
  async function setup() {
    const pending = new Subject<ManagementCriteria>();
    api.criteria.mockReset().mockReturnValue(pending);
    api.saveCriteria.mockReset();
    await TestBed.configureTestingModule({
      imports: [ManagementCriteriaComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProgramManagementUseCase, useValue: api },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ManagementCriteriaComponent);
    fixture.componentRef.setInput("programId", 8);
    fixture.componentRef.setInput("confirmDiscard", () => Promise.resolve(true));
    await fixture.whenStable();
    pending.next(initial());
    await fixture.whenStable();
    return { fixture, component: fixture.componentInstance, pending };
  }
  it("applies centered editor locally, then explicitly saves the complete revision", async () => {
    const { component } = await setup();
    component.edit();
    component.editor.patchValue({ name: "Соответствует кейсу", type: "bool" });
    component.apply();
    expect(component.criteria()[1]).toMatchObject({ type: "bool", minValue: null, maxValue: null });
    expect(api.saveCriteria).not.toHaveBeenCalled();
    api.saveCriteria.mockReturnValue(
      of({ ...initial(), revision: "second", criteria: component.criteria() }),
    );
    component.save();
    expect(api.saveCriteria).toHaveBeenCalledWith(
      8,
      expect.objectContaining({
        expectedRevision: "first",
        criteria: [expect.anything(), expect.objectContaining({ id: null })],
      }),
    );
    expect(component.dirty()).toBe(false);
  });
  it("rejects invalid integer range and keeps editor inputs", async () => {
    const { component } = await setup();
    component.edit();
    component.editor.patchValue({ name: "Шкала", minValue: 4, maxValue: 2 });
    component.apply();
    expect(component.editorError()).toBeTruthy();
    expect(component.editing()).toBe("new");
    component.editor.patchValue({ minValue: 0.5, maxValue: 10 });
    component.apply();
    expect(component.criteria().length).toBe(1);
  });
  it("first score conflict keeps draft and freezes all mutations", async () => {
    const { component } = await setup();
    component.edit();
    component.editor.controls.name.setValue("Новый");
    component.apply();
    api.saveCriteria.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { code: "criteria_locked" } })),
    );
    component.save();
    expect(component.locked()).toBe(true);
    expect(component.criteria().length).toBe(2);
    expect(component.conflictOpen()).toBe(true);
    component.edit();
    expect(component.editing()).toBeNull();
    component.discard();
    expect(component.locked()).toBe(true);
  });
  it("locked snapshot stays readable; preview makes no API writes", async () => {
    const { fixture, component, pending } = await setup();
    pending.next({ ...initial(), locked: true });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("Критерии зафиксированы");
    expect(fixture.nativeElement.querySelector(".criteria__row button")).toBeNull();
    component.openPreview();
    expect(component.previewCriteria()[0].name).toBe("Качество");
    expect(api.saveCriteria).not.toHaveBeenCalled();
  });
});
