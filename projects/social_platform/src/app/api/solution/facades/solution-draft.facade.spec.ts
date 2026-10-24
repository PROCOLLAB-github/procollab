/** @format */
import { TestBed } from "@angular/core/testing";
import { firstValueFrom, of, Subject } from "rxjs";
import { ProgramSolution, SolutionApiError } from "@domain/solution/solution-contract.model";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { fail, ok, Result } from "@domain/shared/result.type";
import {
  UpdateSolutionUseCase,
  UploadSolutionFileUseCase,
  SubmitSolutionUseCase,
} from "../use-cases/solution-draft.use-cases";
import { SolutionDraftFacade } from "./solution-draft.facade";
const original = solutionContractScenarios.find(s => s.name === "created_solo")!
  .response as ProgramSolution;
const source = () => structuredClone(original);
const conflict: SolutionApiError = {
  code: "version_conflict",
  detail: "Заявка изменилась",
  errors: [],
  meta: {},
};

describe("Solution draft editing", () => {
  const update = { execute: vi.fn() },
    files = { execute: vi.fn() },
    submission = { execute: vi.fn() };
  let draft: SolutionDraftFacade;
  beforeEach(() => {
    update.execute.mockReset();
    files.execute.mockReset();
    submission.execute.mockReset();
    TestBed.configureTestingModule({
      providers: [
        SolutionDraftFacade,
        { provide: UpdateSolutionUseCase, useValue: update },
        { provide: UploadSolutionFileUseCase, useValue: files },
        { provide: SubmitSolutionUseCase, useValue: submission },
      ],
    });
    draft = TestBed.inject(SolutionDraftFacade);
    draft.hydrate(source());
  });
  it("saves an incomplete draft with exact versions, zero and false without choosing a case", async () => {
    draft.group().get("1004")!.setValue(0);
    draft.group().get("1005")!.setValue(false);
    expect(draft.group().get("1001")!.value).toBeNull();
    expect(draft.dirty()).toBe(true);
    const saved = {
      ...source(),
      version: 2,
      answers: [
        { fieldId: 1004, value: 0 },
        { fieldId: 1005, value: false },
      ],
    };
    update.execute.mockReturnValue(of(ok(saved)));
    expect((await firstValueFrom(draft.save())).ok).toBe(true);
    expect(update.execute).toHaveBeenCalledWith(12, 301, {
      expectedVersion: 1,
      expectedFormRevision: original.form.revision,
      name: original.name,
      answers: saved.answers,
    });
    expect(draft.dirty()).toBe(false);
    expect(draft.attempted()).toBe(false);
  });
  it("keeps local changes through a team refresh while incorporating untouched server answers", () => {
    draft.name.setValue("Мое решение");
    draft.group().get("1002")!.setValue("Локальный ответ");
    const incoming = { ...source(), version: 2, answers: [{ fieldId: 1004, value: 12 }] };
    draft.hydrate(incoming);
    expect(draft.name.value).toBe("Мое решение");
    expect(draft.group().get("1002")!.value).toBe("Локальный ответ");
    expect(draft.group().get("1004")!.value).toBe(12);
    expect(draft.source()?.version).toBe(2);
    expect(draft.hydrate(source())).toBe(false);
    expect(draft.source()?.version).toBe(2);
  });
  it("retains values on conflict, refreshes the base and only retries on explicit save", async () => {
    draft.group().get("1002")!.setValue("Ответ");
    update.execute.mockReturnValueOnce(of(fail(conflict)));
    expect((await firstValueFrom(draft.save())).ok).toBe(false);
    draft.hydrate({ ...source(), version: 3 });
    draft.reconciled();
    expect(draft.group().get("1002")!.value).toBe("Ответ");
    expect(update.execute).toHaveBeenCalledTimes(1);
    update.execute.mockReturnValue(
      of(ok({ ...source(), version: 4, answers: [{ fieldId: 1002, value: "Ответ" }] })),
    );
    await firstValueFrom(draft.save());
    expect(update.execute.mock.lastCall?.[2].expectedVersion).toBe(3);
  });
  it("keeps removed or retyped local answers visible and blocks save until explicitly resolved", async () => {
    draft.group().get("1002")!.setValue("Не терять");
    const next = source();
    next.form.fields = next.form.fields.filter(field => field.id !== 1002);
    next.form.revision = "b".repeat(64);
    draft.hydrate(next);
    expect(draft.orphaned()).toEqual([
      { fieldId: 1002, label: "Краткое описание", value: "Не терять" },
    ]);
    expect((await firstValueFrom(draft.save())).ok).toBe(false);
    expect(update.execute).not.toHaveBeenCalled();
    draft.resolveLocalCopy(1002);
    expect(draft.orphaned()).toEqual([]);
  });
  it("does not display unsaved values as authoritative after losing edit permission", () => {
    draft.group().get("1002")!.setValue("Локальное");
    const next = source();
    next.version = 2;
    next.permissions.canEdit = false;
    draft.hydrate(next);
    expect(draft.canEdit()).toBe(false);
    expect(draft.displayGroup().get("1002")!.value).toBeNull();
    expect(draft.group().get("1002")!.value).toBe("Локальное");
    expect(draft.dirty()).toBe(true);
  });
  it("cancels an old save on route context change and never applies its late response", () => {
    const response = new Subject<Result<ProgramSolution, SolutionApiError>>();
    update.execute.mockReturnValue(response);
    draft.name.setValue("A");
    const completed = vi.fn();
    draft.save().subscribe({ complete: completed });
    expect(draft.busy()).toBe(true);
    draft.hydrate({ ...source(), id: 999, programId: 13, name: "Другая заявка" });
    response.next(ok({ ...source(), name: "Старое" }));
    expect(completed).toHaveBeenCalled();
    expect(draft.source()?.id).toBe(999);
    expect(draft.name.value).toBe("Другая заявка");
    expect(draft.busy()).toBe(false);
  });
  it("validates file constraints before upload and preserves other input on upload failure", () => {
    draft.group().get("1002")!.setValue("Описание");
    draft.upload(1003, new File(["x"], "x.zip"));
    expect(files.execute).not.toHaveBeenCalled();
    expect(draft.fieldErrors()[1003]).toContain("тип");
    files.execute.mockReturnValue(
      of(fail({ ...conflict, code: "network", detail: "Нет соединения" })),
    );
    draft.upload(1003, new File(["x"], "x.pdf"));
    expect(draft.group().get("1002")!.value).toBe("Описание");
    expect(draft.fieldErrors()[1003]).toBe("Нет соединения");
    expect(draft.busy()).toBe(false);
  });
  it("uploads then binds only on draft save; clearing an answer never deletes the binary", async () => {
    files.execute.mockReturnValue(of(ok({ url: "https://cdn.test/file.pdf" })));
    draft.upload(1003, new File(["%PDF-"], "file.PDF"));
    expect(update.execute).not.toHaveBeenCalled();
    expect(draft.group().get("1003")!.value).toEqual({ url: "https://cdn.test/file.pdf" });
    draft.hydrate(
      { ...source(), answers: [{ fieldId: 1003, value: { url: "https://cdn.test/file.pdf" } }] },
      true,
    );
    draft.clearFile(1003);
    update.execute.mockReturnValue(of(ok({ ...source(), version: 2 })));
    await firstValueFrom(draft.save());
    expect(update.execute.mock.lastCall?.[2].answers).toEqual([{ fieldId: 1003, value: null }]);
    expect(files.execute).toHaveBeenCalledTimes(1);
  });
  it("submits the explicitly confirmed checkpoint and never silently substitutes a newer version", async () => {
    const confirmed = source();
    confirmed.version = 2;
    draft.hydrate({ ...source(), version: 3 });
    submission.execute.mockReturnValue(of(fail(conflict)));
    await firstValueFrom(draft.submit(confirmed));
    expect(submission.execute).toHaveBeenCalledWith(12, 301, {
      expectedVersion: 2,
      expectedFormRevision: confirmed.form.revision,
    });
    expect(draft.source()?.version).toBe(3);
    expect(draft.busy()).toBe(false);
  });
});
