/** @format */

import { Component, input } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, provideRouter } from "@angular/router";
import { BehaviorSubject, of, Subject } from "rxjs";
import {
  GetSolutionRatingUseCase,
  RateSolutionUseCase,
} from "@api/solution/use-cases/solution-evaluation.use-cases";
import { fail, ok } from "@domain/shared/result.type";
import { SolutionRatingFrame } from "@domain/solution/solution-contract.model";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { SolutionTeamComponent } from "../solution/solution-team.component";
import { SolutionEvaluationComponent } from "./solution-evaluation.component";

@Component({ selector: "app-solution-team", template: "<p>Принятый состав</p>" })
class TeamStub {
  readonly solution = input();
  readonly blocked = input();
}
const frame = () =>
  structuredClone(
    solutionContractScenarios.find(s => s.operationId === "getSolutionRating" && s.status === 200)!
      .response,
  ) as SolutionRatingFrame;
const problem = (code: string) => ({ code, detail: "Проверьте оценку.", errors: [], meta: {} });

async function setup(saved = false, initialReturn = "/office/evaluation?tab=completed&q=работа") {
  const data = frame();
  data.isCompleted = saved;
  data.canRate = true;
  data.criteria.forEach(
    c =>
      (c.value = saved
        ? c.type === "bool"
          ? "False"
          : c.type === "str"
            ? "Комментарий"
            : "0"
        : null),
  );
  const params = new BehaviorSubject(
    convertToParamMap({ programId: String(data.program.id), solutionId: String(data.solution.id) }),
  );
  const query = new BehaviorSubject(convertToParamMap({ returnUrl: initialReturn }));
  const route = {
    paramMap: params,
    queryParamMap: query,
    snapshot: { queryParamMap: query.value },
    pathFromRoot: [] as unknown[],
  };
  route.pathFromRoot = [route];
  const get = { execute: vi.fn(() => of(ok(data))) };
  const rate = { execute: vi.fn(() => of(ok({ ...data, isCompleted: true }))) };
  TestBed.configureTestingModule({
    imports: [SolutionEvaluationComponent],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: route },
      { provide: GetSolutionRatingUseCase, useValue: get },
      { provide: RateSolutionUseCase, useValue: rate },
    ],
  });
  TestBed.overrideComponent(SolutionEvaluationComponent, {
    remove: { imports: [SolutionTeamComponent] },
    add: { imports: [TeamStub] },
  });
  const fixture = TestBed.createComponent(SolutionEvaluationComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  const page = fixture.componentInstance;
  const fill = async () => {
    for (const c of data.criteria)
      page
        .renderer()!
        .form.get(String(c.id))!
        .setValue(c.type === "bool" ? false : c.type === "str" ? "Текст" : 0);
    fixture.detectChanges();
    await fixture.whenStable();
  };
  return { data, page, fixture, params, get, rate, fill };
}

describe("Solution evaluation using the shared criterion form", () => {
  it("keeps literal True/False comments as text while rendering actual booleans", async () => {
    const { page } = await setup();
    expect(page.text("False")).toBe("False");
    expect(page.text("True")).toBe("True");
    expect(page.text(false)).toBe("Нет");
    expect(page.text(0)).toBe("0");
  });
  it("protects a literal empty-answer label and retains it when the criterion disappears", async () => {
    const { page, data, get } = await setup();
    const comment = data.criteria.find(c => c.type === "str")!;
    page.form.setValue({ ...page.form.getRawValue(), [comment.id]: "Не указано" });
    expect(page.hasUnsavedChanges()).toBe(true);
    const beforeUnload = { preventDefault: vi.fn(), returnValue: undefined };
    page.beforeUnload(beforeUnload as unknown as BeforeUnloadEvent);
    expect(beforeUnload.preventDefault).toHaveBeenCalledOnce();
    expect(beforeUnload.returnValue).toBe("");
    const newer = structuredClone(data);
    newer.criteria = newer.criteria.filter(c => c.id !== comment.id);
    get.execute.mockReturnValue(of(ok(newer)));
    page.reload(true);
    expect(page.previous()).toEqual([{ name: comment.name, value: "Не указано" }]);
  });
  it("requires numeric/boolean answers, preserves zero/false and keeps inputs across the Team tab", async () => {
    const { page, fixture, fill } = await setup();
    page.prepare();
    expect(page.confirmation()).toBe(false);
    await fill();
    const renderer = page.renderer();
    page.teamTab.set(true);
    fixture.detectChanges();
    page.teamTab.set(false);
    fixture.detectChanges();
    expect(page.renderer()).toBe(renderer);
    page.prepare();
    expect(page.confirmation()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain("Нет");
    page.closeConfirmation();
    expect(page.hasUnsavedChanges()).toBe(true);
  });
  it("sends the real criterion IDs, confirmed revision and zero/False exactly once while pending", async () => {
    const { page, fixture, data, rate, fill } = await setup();
    const pending = new Subject<ReturnType<typeof ok<SolutionRatingFrame>>>();
    rate.execute.mockReturnValue(pending);
    await fill();
    page.prepare();
    page.confirm();
    page.confirm();
    page.closeConfirmation();
    expect(rate.execute).toHaveBeenCalledTimes(1);
    expect(page.confirmation()).toBe(true);
    expect(page.canLeave()).toBe(false);
    expect(rate.execute.mock.calls[0]).toEqual([
      data.program.id,
      data.solution.id,
      {
        expectedCriteriaRevision: data.criteriaRevision,
        scores: data.criteria.map(c => ({
          criterionId: c.id,
          value: c.type === "bool" ? "False" : c.type === "str" ? "Текст" : "0",
        })),
      },
    ]);
    const saved = structuredClone(data);
    saved.isCompleted = true;
    saved.criteria.forEach(
      c => (c.value = c.type === "bool" ? "False" : c.type === "str" ? "Текст" : "0"),
    );
    pending.next(ok(saved));
    pending.complete();
    fixture.detectChanges();
    expect(page.editing()).toBe(false);
    expect(page.hasUnsavedChanges()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain("Оценка сохранена");
    page.edit();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(page.hasUnsavedChanges()).toBe(false);
  });
  it("keeps local answers after a failed save and refreshes changed criteria by ID/type", async () => {
    const { page, fixture, data, rate, get, fill } = await setup();
    rate.execute.mockReturnValue(of(fail(problem("criteria_changed"))) as never);
    await fill();
    page.prepare();
    page.confirm();
    expect(page.saveError()?.code).toBe("criteria_changed");
    expect(page.hasUnsavedChanges()).toBe(true);
    const newer = structuredClone(data);
    newer.criteriaRevision = "f".repeat(64);
    newer.criteria[0].name = "Обновленный критерий";
    get.execute.mockReturnValue(of(ok(newer)));
    page.reload(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(page.frame()?.criteriaRevision).toBe(newer.criteriaRevision);
    expect(page.form.getRawValue()[String(data.criteria[0].id)]).toBe(0);
    expect(page.saveError()).toBeNull();
    page.prepare();
    expect(page.confirmation()).toBe(true);
  });
  it.each(["not_found", "not_program_expert"])(
    "shows saved/closed results read-only and clears a revoked evaluation frame: %s",
    async code => {
      const { page, fixture, rate, get, data } = await setup(true);
      expect(page.editing()).toBe(false);
      page.edit();
      fixture.detectChanges();
      await fixture.whenStable();
      rate.execute.mockReturnValue(of(fail(problem(code))) as never);
      page.prepare();
      page.confirm();
      fixture.detectChanges();
      expect(page.frame()).toBeNull();
      expect(page.form.value).toEqual({});
      const closed = structuredClone(data);
      closed.canRate = false;
      closed.blockedReason = "Срок оценивания завершен.";
      get.execute.mockReturnValue(of(ok(closed)));
      page.reload();
      fixture.detectChanges();
      expect(page.editing()).toBe(false);
      page.edit();
      expect(page.editing()).toBe(false);
    },
  );
  it("protects local input on leave, cancel, and ignores a previous context's late save", async () => {
    const { page, fixture, rate, params, data, fill } = await setup();
    await fill();
    const stay = page.canLeave();
    page.answerLeave(false);
    expect(await stay).toBe(false);
    const leave = page.canLeave();
    page.answerLeave(true);
    expect(await leave).toBe(true);
    const pending = new Subject<ReturnType<typeof ok<SolutionRatingFrame>>>();
    rate.execute.mockReturnValue(pending);
    page.prepare();
    page.confirm();
    params.next(convertToParamMap({ programId: "999", solutionId: "998" }));
    fixture.detectChanges();
    pending.next(ok({ ...data, isCompleted: true }));
    expect(page.editing()).toBe(true);
    expect(page.busy()).toBe(false);
  });
  it("rejects external or other-program return destinations", async () => {
    const { page, data } = await setup(false, "https://example.test/private");
    expect(page.returnUrl()).toBe(`/office/program/${data.program.id}/solutions-rating`);
  });
});
