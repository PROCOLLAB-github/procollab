/** @format */

import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { SolutionRepositoryPort } from "@domain/solution/ports/solution.repository.port";
import { provideRouter, Router } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { Observable, of, Subject } from "rxjs";
import {
  CreateSolutionUseCase,
  GetSolutionContextUseCase,
  GetSolutionUseCase,
} from "@api/solution/use-cases/solution.use-cases";
import { ProgramSolution, SolutionContext } from "@domain/solution/solution-contract.model";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import { fail, ok } from "@domain/shared/result.type";
import { ProgramSolutionComponent } from "./solution.component";
import { UpdateSolutionUseCase } from "@api/solution/use-cases/solution-draft.use-cases";
import { canLeaveSolution } from "@ui/routes/program/solution-leave.guard";

const solution = solutionContractScenarios.find(s => s.name === "created_solo")!
  .response as ProgramSolution;
const context: SolutionContext = {
  programId: 12,
  storageMode: "solution",
  isRegistered: true,
  isCompetitive: true,
  submissionOpen: true,
  submissionDeadline: null,
  canCreate: true,
  blockedReason: null,
  currentApplication: null,
};

describe("Solution route foundation", () => {
  const get = { execute: vi.fn() };
  const create = { execute: vi.fn() };
  const getContext = { execute: vi.fn() };
  const update = { execute: vi.fn() };
  beforeEach(() => {
    get.execute.mockReset().mockReturnValue(of(ok(solution)));
    create.execute.mockReset().mockReturnValue(of(ok(solution)));
    getContext.execute.mockReset().mockReturnValue(of(ok(context)));
    update.execute.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: "office/program/:programId",
            children: [
              { path: "solutions/new", component: ProgramSolutionComponent },
              {
                path: "solutions/:solutionId/edit",
                component: ProgramSolutionComponent,
                canDeactivate: [canLeaveSolution],
              },
              {
                path: "solutions/:solutionId",
                component: ProgramSolutionComponent,
                canDeactivate: [canLeaveSolution],
              },
            ],
          },
        ]),
        { provide: GetSolutionUseCase, useValue: get },
        { provide: CreateSolutionUseCase, useValue: create },
        { provide: GetSolutionContextUseCase, useValue: getContext },
        { provide: UpdateSolutionUseCase, useValue: update },
        { provide: ProfileInfoService, useValue: { profile: signal({ id: 7 }) } },
        {
          provide: SolutionRepositoryPort,
          useValue: {
            invitations: vi
              .fn()
              .mockReturnValue(of({ count: 0, next: null, previous: null, results: [] })),
          },
        },
      ],
    });
  });

  it("loads the exact program/solution and switches tabs without a second request", async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl("/office/program/12/solutions/88/edit", ProgramSolutionComponent);
    expect(get.execute).toHaveBeenCalledWith(12, 88);
    expect(harness.routeNativeElement?.textContent).toContain(solution.name);
    await TestBed.inject(Router).navigateByUrl("/office/program/12/solutions/88/edit?tab=team");
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain("Команда заявки");
    expect(get.execute).toHaveBeenCalledTimes(1);
    expect(harness.routeNativeElement?.querySelector('a[aria-current="page"]')?.textContent).toBe(
      "Команда",
    );
  });

  it("an existing current application redirects without posting", async () => {
    getContext.execute.mockReturnValue(
      of(
        ok({
          ...context,
          canCreate: false,
          currentApplication: {
            kind: "solution",
            programId: 12,
            solutionId: 88,
            name: "Существующее",
          },
        }),
      ),
    );
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl("/office/program/12/solutions/new");
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe("/office/program/12/solutions/88");
    expect(create.execute).not.toHaveBeenCalled();
  });

  it("error state supports retry and does not render stale solution data", async () => {
    get.execute.mockReturnValueOnce(
      of(fail({ code: "not_found", detail: "Заявка не найдена.", errors: [], meta: {} })),
    );
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      "/office/program/12/solutions/88",
      ProgramSolutionComponent,
    );
    expect(harness.routeNativeElement?.querySelector('[role="alert"]')?.textContent).toContain(
      "не найдена",
    );
    component.reload();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain(solution.name);
    expect(get.execute).toHaveBeenCalledTimes(2);
  });

  it("cancels the previous program request when navigating to another program", async () => {
    const previous = new Subject<ReturnType<typeof ok<ProgramSolution>>>();
    let cancelled = false;
    const request = new Observable<ReturnType<typeof ok<ProgramSolution>>>(observer => {
      const subscription = previous.subscribe(observer);
      return () => {
        cancelled = true;
        subscription.unsubscribe();
      };
    });
    get.execute.mockImplementation((programId: number) =>
      programId === 12 ? request : of(ok({ ...solution, programId })),
    );
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      "/office/program/12/solutions/88",
      ProgramSolutionComponent,
    );
    await harness.navigateByUrl("/office/program/13/solutions/99", ProgramSolutionComponent);
    previous.next(ok(solution));
    expect(component.solution()?.programId).toBe(13);
    expect(get.execute).toHaveBeenLastCalledWith(13, 99);
    expect(cancelled).toBe(true);
  });

  it("keeps input across tabs and a team refresh, then saves from the Team tab with the fresh version", async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      "/office/program/12/solutions/88/edit",
      ProgramSolutionComponent,
    );
    component.draft.group().get("1002")!.setValue("Ответ из вкладки решения");
    const confirmation = vi.spyOn(window, "confirm").mockReturnValue(false);
    await TestBed.inject(Router).navigateByUrl("/office/program/12/solutions/88/edit?tab=team");
    get.execute.mockReturnValue(of(ok({ ...solution, version: 2 })));
    component.refreshTeam();
    harness.detectChanges();
    expect(confirmation).not.toHaveBeenCalled();
    expect(component.draft.group().get("1002")!.value).toBe("Ответ из вкладки решения");
    const saved = {
      ...solution,
      version: 3,
      answers: [{ fieldId: 1002, value: "Ответ из вкладки решения" }],
    };
    update.execute.mockReturnValue(of(ok(saved)));
    component.saveDraft();
    harness.detectChanges();
    expect(update.execute.mock.lastCall?.[2].expectedVersion).toBe(2);
    expect(component.draft.dirty()).toBe(false);
    expect(harness.routeNativeElement?.textContent).toContain("Черновик сохранен");
    confirmation.mockRestore();
  });

  it("refreshes a conflict without automatically saving again or losing the edited answer", async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      "/office/program/12/solutions/88",
      ProgramSolutionComponent,
    );
    component.draft.group().get("1002")!.setValue("Несохраненное");
    update.execute.mockReturnValue(
      of(
        fail({ code: "form_revision_conflict", detail: "Форма изменилась", errors: [], meta: {} }),
      ),
    );
    get.execute.mockReturnValue(
      of(ok({ ...solution, version: 2, form: { ...solution.form, revision: "b".repeat(64) } })),
    );
    component.saveDraft();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(update.execute).toHaveBeenCalledTimes(1);
    expect(component.draft.group().get("1002")!.value).toBe("Несохраненное");
    expect(component.draft.source()?.form.revision).toBe("b".repeat(64));
    expect(component.draft.dirty()).toBe(true);
  });

  it("blocks leaving or reload with unsaved input, while an explicit discard restores server data", async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      "/office/program/12/solutions/88",
      ProgramSolutionComponent,
    );
    component.draft.name.setValue("Местное имя");
    const confirmation = vi.spyOn(window, "confirm").mockReturnValue(false);
    await TestBed.inject(Router).navigateByUrl("/office/program/13/solutions/99");
    expect(TestBed.inject(Router).url).toBe("/office/program/12/solutions/88");
    const event = { preventDefault: vi.fn(), returnValue: undefined };
    component.onBeforeUnload(event as unknown as BeforeUnloadEvent);
    expect(event.preventDefault).toHaveBeenCalled();
    confirmation.mockReturnValue(true);
    component.discardDraft();
    expect(component.draft.name.value).toBe(solution.name);
    expect(component.draft.dirty()).toBe(false);
    confirmation.mockRestore();
  });
});
