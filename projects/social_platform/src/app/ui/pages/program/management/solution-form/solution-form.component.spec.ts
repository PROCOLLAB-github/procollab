/** @format */

import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import {
  GetManagedSolutionFormUseCase,
  GetSolutionTemplatesUseCase,
  SaveManagedSolutionFormUseCase,
} from "@api/solution/use-cases/solution-form.use-cases";
import {
  SolutionFormManagement,
  SolutionTemplates,
} from "@domain/solution/solution-contract.model";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { fail, ok } from "@domain/shared/result.type";
import { ManagementSolutionFormComponent } from "./solution-form.component";

const base = solutionContractScenarios.find(s => s.name === "form_management")!
  .response as SolutionFormManagement;
const templates = solutionContractScenarios.find(s => s.name === "templates")!
  .response as SolutionTemplates;
describe("Конструктор формы решения", () => {
  const read = { execute: vi.fn() },
    save = { execute: vi.fn() },
    list = { execute: vi.fn() };
  beforeEach(() => {
    read.execute.mockReset().mockReturnValue(of(ok(structuredClone(base))));
    save.execute.mockReset().mockReturnValue(of(ok(structuredClone(base))));
    list.execute.mockReset().mockReturnValue(of(ok(structuredClone(templates))));
    TestBed.configureTestingModule({
      imports: [ManagementSolutionFormComponent],
      providers: [
        { provide: GetManagedSolutionFormUseCase, useValue: read },
        { provide: SaveManagedSolutionFormUseCase, useValue: save },
        { provide: GetSolutionTemplatesUseCase, useValue: list },
      ],
    });
  });
  async function setup() {
    const fixture = TestBed.createComponent(ManagementSolutionFormComponent);
    fixture.componentRef.setInput("programId", base.form.programId);
    fixture.componentRef.setInput("confirmDiscard", () => Promise.resolve(true));
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }
  it("renders server usage, locks used types and keeps system case", async () => {
    const fixture = await setup(),
      component = fixture.componentInstance;
    expect(fixture.nativeElement.textContent).toContain("Форма решения");
    expect(component.templateChoice.disabled).toBe(true);
    const used = component.fields().find(field => component.usage(field)?.answersCount)!;
    expect(component.canDelete(used)).toBe(false);
    component.edit(used);
    expect(component.editor.controls.type.disabled).toBe(true);
    expect(component.editor.controls.purpose.disabled).toBe(true);
    component.remove(used);
    expect(component.fields().some(field => field.id === used.id)).toBe(true);
  });
  it("copies a template locally with null API IDs and no automatic save", async () => {
    read.execute.mockReturnValue(
      of(ok({ ...structuredClone(base), hasAnswers: false, fieldsUsage: [] })),
    );
    const fixture = await setup(),
      component = fixture.componentInstance;
    component.templateChoice.setValue("hackathon");
    await component.applyTemplate();
    expect(component.fields().every(field => field.id === null)).toBe(true);
    expect(component.fields().some(field => field.purpose === "repository" && field.required)).toBe(
      true,
    );
    expect(save.execute).not.toHaveBeenCalled();
    expect(component.dirty()).toBe(true);
  });
  it.each(["case_championship", "hackathon"] as const)(
    "starts an unconfigured form clean and only confirms discarding real edits: %s",
    async template => {
      read.execute.mockReturnValue(
        of(
          ok({
            ...structuredClone(base),
            form: {
              ...structuredClone(base.form),
              template: null,
              isConfigured: false,
              fields: [],
            },
            hasAnswers: false,
            hasSolutions: false,
            affectedDraftCount: 0,
            fieldsUsage: [],
          }),
        ),
      );
      const fixture = await setup(),
        component = fixture.componentInstance,
        confirmDiscard = vi.fn(() => Promise.resolve(false));
      fixture.componentRef.setInput("confirmDiscard", confirmDiscard);
      fixture.detectChanges();
      expect(component.dirty()).toBe(false);
      expect(component.template()).toBeNull();
      component.templateChoice.setValue(template);
      expect(component.dirty()).toBe(false);
      await component.applyTemplate();
      expect(confirmDiscard).not.toHaveBeenCalled();
      expect(component.template()).toBe(template);
      expect(component.fields().length).toBeGreaterThan(0);
      expect(component.dirty()).toBe(true);
      expect(save.execute).not.toHaveBeenCalled();
      const edits = component.fields();
      await component.applyTemplate();
      expect(confirmDiscard).toHaveBeenCalledTimes(1);
      expect(component.fields()).toBe(edits);
      expect(save.execute).not.toHaveBeenCalled();
    },
  );
  it("sends exact form revision and excludes client keys from PUT", async () => {
    const fixture = await setup(),
      component = fixture.componentInstance;
    component.edit(component.fields()[1]);
    component.editor.controls.label.setValue("Измененная подпись");
    component.applyField();
    component.save();
    const [programId, command] = save.execute.mock.calls[0];
    expect(programId).toBe(base.form.programId);
    expect(command.expectedRevision).toBe(base.form.revision);
    expect(command.fields[1].label).toBe("Измененная подпись");
    expect(command.fields.every((field: Record<string, unknown>) => !("clientKey" in field))).toBe(
      true,
    );
  });
  it.each(["case_championship", "hackathon"] as const)(
    "guides an incomplete %s template to its case editor without a failed request",
    async template => {
      read.execute.mockReturnValue(
        of(ok({ ...structuredClone(base), hasAnswers: false, fieldsUsage: [] })),
      );
      const fixture = await setup(),
        component = fixture.componentInstance;
      component.templateChoice.setValue(template);
      await component.applyTemplate();
      fixture.detectChanges();
      const caseField = component.fields().find(field => field.purpose === "case")!;
      const action = template === "hackathon" ? "Добавить задачи" : "Добавить кейсы";
      expect(fixture.nativeElement.textContent).toContain(action);
      component.save();
      expect(save.execute).not.toHaveBeenCalled();
      expect(component.editing()).toBe(caseField.clientKey);
      expect(component.editorError()).toContain(template === "hackathon" ? "трек" : "кейс");
      component.addOption();
      component.editor.controls.options.at(0).setValue("Городская среда");
      component.applyField();
      component.save();
      expect(save.execute).toHaveBeenCalledTimes(1);
      expect(save.execute.mock.calls[0][1].fields[0].options).toEqual(["Городская среда"]);
    },
  );
  it("keeps local edits on failure and merges fresh fields on revision conflict", async () => {
    const fixture = await setup(),
      component = fixture.componentInstance;
    component.edit(component.fields()[1]);
    component.editor.controls.label.setValue("Моя подпись");
    component.applyField();
    const added = {
      ...structuredClone(base.form.fields[1]),
      id: 9999,
      position: 10,
      label: "Добавлено коллегой",
    };
    read.execute.mockReturnValue(
      of(
        ok({
          ...structuredClone(base),
          form: { ...base.form, revision: "b".repeat(64), fields: [...base.form.fields, added] },
        }),
      ),
    );
    save.execute.mockReturnValue(
      of(
        fail({ code: "form_revision_conflict", detail: "Форма изменилась", errors: [], meta: {} }),
      ),
    );
    component.save();
    await fixture.whenStable();
    expect(component.fields().find(field => field.id === base.form.fields[1].id)!.label).toBe(
      "Моя подпись",
    );
    expect(component.fields().some(field => field.id === 9999)).toBe(true);
    expect(component.snapshot()?.form.revision).toBe("b".repeat(64));
    expect(save.execute).toHaveBeenCalledTimes(1);
    expect(component.dirty()).toBe(true);
  });
  it("new program cancels old reads and cannot render their late result", async () => {
    const old = new Subject<ReturnType<typeof ok<SolutionFormManagement>>>();
    read.execute.mockReturnValueOnce(old);
    const fixture = await setup(),
      component = fixture.componentInstance;
    fixture.componentRef.setInput("programId", 13);
    fixture.detectChanges();
    await fixture.whenStable();
    old.next(
      ok({
        ...structuredClone(base),
        form: { ...base.form, programId: 12, revision: "c".repeat(64) },
      }),
    );
    expect(read.execute).toHaveBeenLastCalledWith(13);
    expect(component.snapshot()?.form.revision).not.toBe("c".repeat(64));
  });
  it("preview never selects the first case and does not upload", async () => {
    const fixture = await setup(),
      component = fixture.componentInstance;
    component.openPreview();
    const caseField = component.previewFields().find(field => field.purpose === "case")!;
    expect(component.previewGroup().get(String(caseField.id))?.value).toBeNull();
    expect(save.execute).not.toHaveBeenCalled();
  });
  it("discard resets changes and the parent dirty state without sending requests", async () => {
    const fixture = await setup(),
      component = fixture.componentInstance,
      states: unknown[] = [];
    component.statusChange.subscribe(state => states.push(state));
    component.move(1, 1);
    fixture.detectChanges();
    expect(component.dirty()).toBe(true);
    component.discard();
    fixture.detectChanges();
    expect(component.dirty()).toBe(false);
    expect(save.execute).not.toHaveBeenCalled();
    expect(states).toContainEqual({ dirty: false, busy: false });
  });
});
