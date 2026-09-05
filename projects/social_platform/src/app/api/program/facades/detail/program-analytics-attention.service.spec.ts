/** @format */
import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
import { GetProgramManagerAssignmentsUseCase } from "@api/program/use-cases/get-program-manager-assignments.use-case";
import { GetProgramManagerAssignmentScoresUseCase } from "@api/program/use-cases/get-program-manager-assignment-scores.use-case";
import { GetProgramManagerParticipantsWithoutTeamUseCase } from "@api/program/use-cases/get-program-manager-participants-without-team.use-case";
import { GetProgramManagerProjectsAwaitingEvaluationUseCase } from "@api/program/use-cases/get-program-manager-projects-awaiting-evaluation.use-case";
import {
  participantsPage,
  projectsPage,
} from "@domain/program/program-analytics-attention.fixture";
import { fail, ok } from "@domain/shared/result.type";
import {
  ProgramAnalyticsDrilldownService,
  AnalyticsAttentionView,
} from "./program-analytics-drilldown.service";

describe.each([
  "participants-without-team",
  "projects-awaiting-evaluation",
] as AnalyticsAttentionView[])("Attention facade: %s", view => {
  const participants = { execute: vi.fn() };
  const projects = { execute: vi.fn() };
  const assignments = { execute: vi.fn().mockReturnValue(of(ok([]))) };
  const response = () =>
    view === "participants-without-team" ? participantsPage() : projectsPage();
  const active = () => (view === "participants-without-team" ? participants : projects);
  let service: ProgramAnalyticsDrilldownService;
  beforeEach(() => {
    participants.execute.mockReset().mockReturnValue(of(ok(participantsPage())));
    projects.execute.mockReset().mockReturnValue(of(ok(projectsPage())));
    assignments.execute.mockClear();
    TestBed.configureTestingModule({
      providers: [
        ProgramAnalyticsDrilldownService,
        { provide: GetProgramManagerParticipantsWithoutTeamUseCase, useValue: participants },
        { provide: GetProgramManagerProjectsAwaitingEvaluationUseCase, useValue: projects },
        { provide: GetProgramManagerAssignmentsUseCase, useValue: assignments },
        { provide: GetProgramManagerAssignmentScoresUseCase, useValue: { execute: vi.fn() } },
      ],
    });
    service = TestBed.inject(ProgramAnalyticsDrilldownService);
  });

  it("lazy open, свежий count, нет назначения/автоподгрузки страниц", () => {
    expect(active().execute).not.toHaveBeenCalled();
    service.openAttention(12, view);
    expect(active().execute).toHaveBeenCalledExactlyOnceWith(12, {
      search: "",
      limit: 25,
      offset: 0,
    });
    expect(service.attentionCount()).toBe(1);
    expect(service.attentionRange()).toBe("1–1 из 1");
    expect(service.attentionPage()).toEqual(response());
    expect(assignments.execute).not.toHaveBeenCalled();
  });

  it("draft без request, search trim/reset offset, clear, next/previous", () => {
    const page = response();
    active().execute.mockReturnValue(
      of(ok({ ...page, count: 61, results: Array.from({ length: 25 }, () => page.results[0]) })),
    );
    service.openAttention(12, view);
    service.changeAttentionPage(1);
    expect(service.attentionOffset()).toBe(25);
    expect(service.attentionRange()).toBe("26–50 из 61");
    service.changeAttentionPage(-1);
    expect(service.attentionOffset()).toBe(0);
    service.changeAttentionPage(1);
    service.searchDraft.set(" Анна ");
    expect(active().execute).toHaveBeenCalledTimes(4);
    service.applyAttentionSearch();
    expect(active().execute).toHaveBeenLastCalledWith(12, { search: "Анна", limit: 25, offset: 0 });
    service.clearAttentionSearch();
    expect(active().execute).toHaveBeenLastCalledWith(12, { search: "", limit: 25, offset: 0 });
  });

  it("search empty не error; repeated open очищает draft и старые results", () => {
    service.openAttention(12, view);
    active().execute.mockReturnValueOnce(of(ok({ ...response(), count: 0, results: [] })));
    service.searchDraft.set("несуществующий");
    service.applyAttentionSearch();
    expect(service.attentionCount()).toBe(0);
    expect(service.attentionError()).toBeNull();
    expect(service.appliedSearch()).toBe("несуществующий");
    const pending = new Subject();
    active().execute.mockReturnValueOnce(pending);
    service.openAttention(12, view);
    expect(service.searchDraft()).toBe("");
    expect(service.appliedSearch()).toBe("");
    expect(service.attentionPage()).toBeNull();
    expect(service.attentionPending()).toBe(true);
  });

  it.each(["unauthorized", "forbidden", "not_found", "network"] as const)(
    "retry %s сохраняет search/offset",
    kind => {
      active().execute.mockReturnValue(of(ok({ ...response(), count: 61 })));
      service.openAttention(12, view);
      service.searchDraft.set("Анна");
      service.applyAttentionSearch();
      active().execute.mockReturnValueOnce(of(fail({ kind })));
      service.changeAttentionPage(1);
      expect(service.attentionError()).toEqual({ kind });
      expect(service.open()).toBe(true);
      expect(service.attentionPage()).toBeNull();
      service.loadAttention();
      expect(active().execute).toHaveBeenLastCalledWith(12, {
        search: "Анна",
        limit: 25,
        offset: 25,
      });
      expect(service.attentionError()).toBeNull();
    },
  );

  it.each(["search", "page", "close", "other-root", "program", "destroy"])(
    "%s отменяет Subject и поздний ответ",
    action => {
      const old = new Subject();
      active().execute.mockReturnValueOnce(old);
      service.openAttention(12, view);
      expect(old.observed).toBe(true);
      switch (action) {
        case "search":
          service.searchDraft.set("Анна");
          service.applyAttentionSearch();
          break;
        case "page":
          service.attentionOffset.set(25);
          service.changeAttentionPage(-1);
          break;
        case "other-root":
          service.openAssignments(12, "all");
          break;
        case "program":
          service.openAttention(13, view);
          break;
        case "destroy":
          TestBed.resetTestingModule();
          break;
        default:
          service.close();
      }
      expect(old.observed).toBe(false);
      const current = service.attentionPage();
      old.next(ok({ ...response(), count: 999 }));
      expect(service.attentionPage()).toBe(current);
    },
  );
});
