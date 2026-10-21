/** @format */

import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { AnalyticsEvaluationProgressComponent } from "./evaluation-progress.component";
import { GetProgramManagerAssignmentsUseCase } from "@api/program/use-cases/get-program-manager-assignments.use-case";
import {
  ProgramAnalyticsAssignment,
  ProgramAnalyticsOverview,
} from "@domain/program/program-analytics.model";
import { assignment } from "@domain/program/program-analytics-assignment.fixture";
import { fail, ok } from "@domain/shared/result.type";

describe("AnalyticsEvaluationProgressComponent", () => {
  const requests = { execute: vi.fn() };
  const status = (
    overrides: Partial<ProgramAnalyticsOverview["evaluationStatus"]> = {},
  ): ProgramAnalyticsOverview["evaluationStatus"] => ({
    mode: "distributed",
    maxEvaluationsPerProject: 2,
    requiredEvaluators: 2,
    assignments: { total: 2, pending: 1, evaluated: 1 },
    projects: { submitted: 2, awaitingEvaluation: 1, partiallyEvaluated: 1, evaluated: 0 },
    ...overrides,
  });
  const render = (value = status(), id: number | null = 12) => {
    const fixture = TestBed.createComponent(AnalyticsEvaluationProgressComponent);
    fixture.componentRef.setInput("status", value);
    fixture.componentRef.setInput("programId", id);
    fixture.detectChanges();
    return fixture;
  };
  beforeEach(() => {
    requests.execute.mockReset().mockReturnValue(of(ok([assignment()])));
    TestBed.configureTestingModule({
      imports: [AnalyticsEvaluationProgressComponent],
      providers: [{ provide: GetProgramManagerAssignmentsUseCase, useValue: requests }],
    });
  });

  it("shows completed expert assignments independently of fully evaluated projects", () => {
    const fixture = render();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-testid="evaluation-percentage"]')?.textContent).toContain(
      "50%",
    );
    expect(root.querySelector('[role="progressbar"]')?.getAttribute("aria-valuetext")).toBe(
      "Выполнено 1 из 2 назначений",
    );
    expect(root.textContent).toContain("Готово 1 из 2");
    expect(root.querySelector("canvas")).toBeNull();
    expect(requests.execute).toHaveBeenCalledExactlyOnceWith(12, "all");
  });

  it("keeps all grouped experts and prioritizes unfinished assignments including not-ready work", () => {
    const row = (id: number, state: ProgramAnalyticsAssignment["status"], number: number) =>
      assignment({
        assignmentId: number,
        expert: { ...assignment().expert, expertId: id },
        status: state,
      });
    requests.execute.mockReturnValue(
      of(
        ok([
          row(1, "completed", 1),
          row(1, "pending", 2),
          row(1, "not_ready", 3),
          row(2, "completed", 4),
          row(3, "in_progress", 5),
          row(4, "pending", 6),
        ]),
      ),
    );
    const fixture = render(status({ assignments: { total: 6, evaluated: 2, pending: 4 } }));
    const rows = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll("[data-expert-id]"),
    );
    expect(rows.map(row => row.getAttribute("data-expert-id"))).toEqual(["1", "3", "4", "2"]);
    expect(rows[0].querySelector("strong")?.textContent).toBe("1 из 3");
    expect(rows[1].querySelector("strong")?.textContent).toBe("0 из 1");
    expect(rows[3].querySelector("strong")?.textContent).toBe("1 из 1");
    const list = fixture.nativeElement.querySelector(".evaluation-progress__list");
    expect(list.getAttribute("tabindex")).toBe("0");
    expect(list.getAttribute("aria-label")).toBe("Прогресс всех экспертов");
  });

  it.each(["open", "distributed"] as const)(
    "does not invent a percentage when %s mode has no assignments",
    mode => {
      const fixture = render(status({ mode, assignments: { total: 0, evaluated: 0, pending: 0 } }));
      expect(fixture.nativeElement.querySelector("[role=progressbar]")).toBeNull();
      expect(fixture.nativeElement.querySelector("[data-testid=evaluation-percentage]")).toBeNull();
      expect(requests.execute).not.toHaveBeenCalled();
    },
  );

  it("does not round unfinished work up to 100%", () => {
    const fixture = render(status({ assignments: { total: 200, evaluated: 199, pending: 1 } }));
    expect(
      fixture.nativeElement.querySelector("[data-testid=evaluation-percentage]").textContent,
    ).toContain("99%");
    expect(
      fixture.nativeElement.querySelector("[role=progressbar]").getAttribute("aria-valuenow"),
    ).toBe("99.5");
  });

  it("preserves totals when expert loading fails and retries only the expert list", () => {
    requests.execute
      .mockReturnValueOnce(of(fail({ kind: "network" })))
      .mockReturnValue(of(ok([assignment()])));
    const fixture = render();
    expect(fixture.nativeElement.querySelector("[role=alert]").textContent).toContain(
      "Не удалось загрузить экспертов",
    );
    expect(fixture.nativeElement.textContent).toContain("Готово 1 из 2");
    fixture.nativeElement.querySelector(".evaluation-progress__retry").click();
    fixture.detectChanges();
    expect(requests.execute).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector("[role=alert]")).toBeNull();
    expect(fixture.nativeElement.querySelectorAll("[data-expert-id]")).toHaveLength(1);
  });

  it("cancels previous-program requests and releases unfinished requests on destroy", () => {
    const old = new Subject<ReturnType<typeof ok<ProgramAnalyticsAssignment[]>>>();
    const current = new Subject<ReturnType<typeof ok<ProgramAnalyticsAssignment[]>>>();
    requests.execute.mockReturnValueOnce(old).mockReturnValueOnce(current);
    const fixture = render();
    expect(old.observed).toBe(true);
    fixture.componentRef.setInput("programId", 13);
    fixture.detectChanges();
    expect(old.observed).toBe(false);
    expect(current.observed).toBe(true);
    old.next(ok([assignment()]));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("[data-expert-id]")).toHaveLength(0);
    current.next(ok([assignment()]));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("[data-expert-id]")).toHaveLength(1);
    fixture.destroy();
    expect(current.observed).toBe(false);
  });

  it("does not fetch without an authorized program context", () => {
    render(status(), null);
    expect(requests.execute).not.toHaveBeenCalled();
  });
});
