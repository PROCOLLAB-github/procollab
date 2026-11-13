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
  it("locked snapshot stays readable, disables actions and has no preview", async () => {
    const { fixture, component, pending } = await setup();
    pending.next({ ...initial(), locked: true });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("Критерии зафиксированы");
    expect(fixture.nativeElement.querySelector(".criteria__row button").disabled).toBe(true);
    expect(fixture.nativeElement.textContent).not.toContain("Предпросмотр");
    expect(api.saveCriteria).not.toHaveBeenCalled();
  });
  it("mode change is dirty for an old API snapshot and invalid totals never write", async () => {
    const { component, fixture } = await setup();
    const select = fixture.nativeElement.querySelector(
      "#criteria-scoring-mode",
    ) as HTMLInputElement;
    select.checked = true;
    select.dispatchEvent(new Event("change"));
    await fixture.whenStable();
    expect(component.dirty()).toBe(true);
    expect(component.weightsError()).toBeTruthy();
    component.save();
    expect(api.saveCriteria).not.toHaveBeenCalled();
    component.edit(component.criteria()[0]);
    component.editor.controls.weightPercent.setValue(100);
    component.apply();
    expect(component.weightTotal()).toBe(100);
    expect(component.weightsError()).toBeNull();
    api.saveCriteria.mockReturnValue(
      of({ ...initial(), scoringMode: "weighted_percent", criteria: component.criteria() }),
    );
    component.save();
    expect(api.saveCriteria).toHaveBeenCalledWith(
      8,
      expect.objectContaining({
        scoringMode: "weighted_percent",
        criteria: [expect.objectContaining({ weightPercent: 100 })],
      }),
    );
    expect(component.dirty()).toBe(false);
  });
  it("validates fractional weights and counts cents without floating point sum errors", async () => {
    const { component } = await setup();
    component.scoringMode.set("weighted_percent");
    component.edit(component.criteria()[0]);
    for (const weight of [0, -2, 100.001, NaN, Infinity]) {
      component.editor.controls.weightPercent.setValue(weight);
      component.apply();
      expect(component.editing()).not.toBeNull();
    }
    component.criteria.set(
      [33.33, 33.33, 33.34].map((weightPercent, i) => ({
        ...initial().criteria[0],
        id: i + 1,
        weightPercent,
      })),
    );
    expect(component.weightTotal()).toBe(100);
    expect(component.weightsError()).toBeNull();
  });
  it("keeps existing float definitions when only their weight changes", async () => {
    const { component, pending } = await setup();
    const criterion = {
      ...initial().criteria[0],
      type: "float" as const,
      minValue: 0.1,
      maxValue: 2.5,
      description: null,
      weightPercent: 100,
    };
    pending.next({ ...initial(), scoringMode: "weighted_percent", criteria: [criterion] });
    component.edit(criterion);
    expect(component.editor.controls.name.disabled).toBe(true);
    expect(component.editor.controls.weightPercent.enabled).toBe(true);
    component.editor.controls.weightPercent.setValue(80);
    component.apply();
    expect(component.criteria()[0]).toEqual({ ...criterion, weightPercent: 80 });
  });
  it("locked weighted mode cannot be switched or edited", async () => {
    const { component, pending } = await setup();
    pending.next({
      ...initial(),
      locked: true,
      scoringMode: "weighted_percent",
      criteria: initial().criteria.map(c => ({ ...c, weightPercent: 100 })),
    });
    component.changeScoringMode({ target: { checked: false } } as unknown as Event);
    expect(component.scoringMode()).toBe("weighted_percent");
    component.changeWeight(component.criteria()[0], 50);
    expect(component.criteria()[0].weightPercent).toBe(100);
  });
  it("edits percentages inline, rejects totals and ignores weights when disabled", async () => {
    const { fixture, component } = await setup();
    component.scoringMode.set("weighted_percent");
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector(
      ".criteria__weight input",
    ) as HTMLInputElement;
    expect(input.getAttribute("type")).toBe("number");
    input.value = "95";
    input.dispatchEvent(new Event("input"));
    await fixture.whenStable();
    expect(component.weightTotal()).toBe(95);
    expect(component.weightsError()).toContain("100%");
    expect(component.dirty()).toBe(true);
    component.save();
    expect(api.saveCriteria).not.toHaveBeenCalled();
    component.changeScoringMode({ target: { checked: false } } as unknown as Event);
    component.edit();
    component.editor.patchValue({ name: "Еще один", type: "bool" });
    component.apply();
    api.saveCriteria.mockReturnValue(of({ ...initial(), criteria: component.criteria() }));
    component.save();
    expect(api.saveCriteria).toHaveBeenCalledWith(
      8,
      expect.objectContaining({
        scoringMode: "legacy",
        criteria: expect.arrayContaining([expect.objectContaining({ id: 1, weightPercent: null })]),
      }),
    );
  });
  it("cancels inline changes back to the loaded weights and mode", async () => {
    const { component } = await setup();
    component.scoringMode.set("weighted_percent");
    component.changeWeight(component.criteria()[0], 100);
    await component.cancel();
    expect(component.scoringMode()).toBe("legacy");
    expect(component.criteria()[0].weightPercent).toBeUndefined();
    expect(component.dirty()).toBe(false);
  });
});
