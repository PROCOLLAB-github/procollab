/** @format */

import { signal } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { RateProjectUseCase } from "@api/program/use-cases/rate-project.use-case";
import { GetProjectRatingsUseCase } from "@api/program/use-cases/get-project-ratings.use-case";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { User } from "@domain/auth/user.model";
import { Program } from "@domain/program/program.model";
import { ProjectRate } from "@domain/project/project-rate";
import { fail, ok } from "@domain/shared/result.type";
import { of, Subject } from "rxjs";
import { RatingCardService } from "./rating-card.service";

describe("RatingCardService evaluation modes", () => {
  const user = Object.assign(new User(), { id: 7 });
  const past = "2026-09-01T00:00:00Z";
  const future = "2026-09-30T00:00:00Z";
  const execute = vi.fn<RateProjectUseCase["execute"]>();
  const refresh = vi.fn<GetProjectRatingsUseCase["execute"]>();
  let service: RatingCardService;
  let programUI: ProgramDetailMainUIInfoService;

  function loadProgram(evaluation: string | undefined = future, registration = past): void {
    programUI.applyFormatingProgramData(
      Object.assign(Program.default(), {
        datetimeRegistrationEnds: registration,
        datetimeEvaluationEnds: evaluation,
      }),
    );
  }

  function project(scored = false): ProjectRate {
    return {
      id: 12,
      name: "Project",
      leader: 9,
      description: "",
      imageAddress: "",
      presentationAddress: "",
      region: "",
      viewsCount: 0,
      industry: 1,
      scored,
      scoredExpertId: scored ? user.id : null,
      ratedExperts: scored ? [user] : [],
      ratedCount: scored ? 1 : 0,
      maxRates: 1,
      criterias: [],
    };
  }

  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-09-09T12:00:00Z"));
    execute.mockReset().mockReturnValue(of(ok(undefined)));
    TestBed.configureTestingModule({
      providers: [
        RatingCardService,
        { provide: GetProjectRatingsUseCase, useValue: { execute: refresh } },
        { provide: RateProjectUseCase, useValue: { execute } },
        ProgramDetailMainUIInfoService,
        { provide: ProfileInfoService, useValue: { profile: signal(user) } },
        { provide: LoggerService, useValue: { error: vi.fn() } },
      ],
    });
    service = TestBed.inject(RatingCardService);
    programUI = TestBed.inject(ProgramDetailMainUIInfoService);
    loadProgram();
  });

  afterEach(() => vi.restoreAllMocks());

  it("starts with create mode and returns to readonly after the first successful rating", () => {
    service.initProject(project());
    expect(programUI.registerDateExpired()).toBe(true);
    expect(service.evaluationDateExpired()).toBe(false);
    expect(service.rateButtonText()).toBe("оценить проект");
    expect(service.isButtonDisabled()).toBe(false);
    expect(service.isRatingFormDisabled()).toBe(false);
    expect(service.showRatingForm()).toBe(true);
    service.confirmRateProject();
    expect(service.projectConfirmed()).toBe(true);
    expect(service.rateButtonText()).toBe("проект оценен");
    expect(service.showRatingForm()).toBe(false);
    expect(service.showEditButton()).toBe(true);
    expect(service.isRatingFormDisabled()).toBe(true);
    expect(service.ratedCount()).toBe(1);
  });

  it("keeps editing until update succeeds, then returns to readonly without incrementing count", () => {
    const response = new Subject<ReturnType<typeof ok<void>>>();
    execute.mockReturnValue(response);
    service.initProject(project(true));
    expect(service.rateButtonText()).toBe("проект оценен");
    expect(service.showEditButton()).toBe(true);
    expect(service.isRatingFormDisabled()).toBe(true);
    service.redoRating();
    service.form().setValue({ score: 4 });
    expect(service.rateButtonText()).toBe("подтвердить изменения");
    expect(service.showRatingForm()).toBe(true);
    expect(service.isRatingFormDisabled()).toBe(false);
    expect(service.showEditButton()).toBe(false);
    expect(service.buttonColor()).toBe("primary");
    expect(service.canOpenModal()).toBe(true);
    service.confirmRateProject();
    expect(service.submitLoading()).toBe(true);
    expect(service.rateButtonText()).toBe("подтвердить изменения");
    expect(execute).toHaveBeenCalledExactlyOnceWith(12, [], { score: 4 });
    response.next(ok(undefined));
    response.complete();
    expect(service.submitLoading()).toBe(false);
    expect(service.rateButtonText()).toBe("проект оценен");
    expect(service.buttonColor()).toBe("green");
    expect(service.showRatingForm()).toBe(false);
    expect(service.showEditButton()).toBe(true);
    expect(service.ratedCount()).toBe(1);
  });

  it("retains edit mode and entered values on update failure, allowing retry", () => {
    service.initProject(project(true));
    service.redoRating();
    service.form().setValue({ score: 5 });
    execute.mockReturnValueOnce(of(fail({ kind: "rate_project_error" as const })));
    service.confirmRateProject();
    expect(service.rateButtonText()).toBe("подтвердить изменения");
    expect(service.showRatingForm()).toBe(true);
    expect(service.projectConfirmed()).toBe(false);
    expect(service.submitLoading()).toBe(false);
    expect(service.form().getRawValue()).toEqual({ score: 5 });
    service.confirmRateProject();
    expect(service.rateButtonText()).toBe("проект оценен");
  });

  it("rejects stale form, retains zero/No and removed answers, and refreshes revision before retry", () => {
    const criterion = {
      id: 1,
      name: "Баллы",
      description: "",
      type: "int" as const,
      minValue: 0,
      maxValue: 10,
      value: "",
      expertId: 0,
    };
    const old = {
      ...project(),
      criteriaRevision: "old",
      criterias: [
        criterion,
        { ...criterion, id: 2, name: "Да/нет", type: "bool" as const },
        { ...criterion, id: 3, name: "Удалённый", type: "str" as const },
      ],
    };
    service.initProject(old);
    service.form().setValue({ 1: 0, 2: false, 3: "Сохраните этот ответ" });
    execute.mockReturnValueOnce(
      of(fail({ kind: "rate_project_error", cause: new HttpErrorResponse({ status: 409 }) })),
    );
    service.confirmRateProject();
    expect(execute).toHaveBeenCalledWith(
      12,
      old.criterias,
      { 1: 0, 2: false, 3: "Сохраните этот ответ" },
      "old",
    );
    expect(service.criteriaChanged()).toBe(true);
    expect(service.projectConfirmed()).toBe(false);
    refresh.mockReturnValueOnce(
      of(
        ok({
          count: 1,
          next: "",
          previous: "",
          results: [{ ...old, criteriaRevision: "new", criterias: old.criterias.slice(0, 2) }],
        }),
      ),
    );
    service.refreshCriteria();
    expect(service.criteriaChanged()).toBe(false);
    expect(service.project()?.criteriaRevision).toBe("new");
    expect(service.form().getRawValue()).toEqual({ 1: 0, 2: false });
    expect(service.retainedAnswers()).toContainEqual({
      name: "Удалённый",
      value: "Сохраните этот ответ",
    });
  });

  it("preserves rating-limit restrictions independently of the evaluation deadline", () => {
    service.initProject({ ...project(), ratedCount: 1 });
    expect(service.rateButtonText()).toBe("лимит оценок достигнут");
    expect(service.isButtonDisabled()).toBe(true);
    loadProgram(past);
    expect(service.rateButtonText()).toBe("оценивание завершено");
    expect(service.canOpenModal()).toBe(false);
  });

  it("allows an assigned evaluator to submit after the managed minimum is reached", () => {
    service.initProject({ ...project(), ratedCount: 2, managedEvaluation: true });
    expect(service.canRate()).toBe(true);
    expect(service.isButtonDisabled()).toBe(false);
    expect(service.rateButtonText()).toBe("оценить проект");
  });

  it("does not submit an empty configured criterion set", () => {
    service.initProject({ ...project(), criteriaRevision: "empty" });
    expect(service.rateButtonText()).toBe("критерии не настроены");
    expect(service.isButtonDisabled()).toBe(true);
    service.confirmRateProject();
    expect(execute).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    "keeps a disabled CTA and readonly criteria after evaluation ends (rated=%s)",
    rated => {
      loadProgram(past, future);
      service.initProject(project(rated));
      expect(programUI.registerDateExpired()).toBe(false);
      expect(service.evaluationDateExpired()).toBe(true);
      expect(service.rateButtonText()).toBe("оценивание завершено");
      expect(service.buttonTooltip()).toBe("Срок оценивания завершен");
      expect(service.showConfirmedState()).toBe(true);
      expect(service.showRatingForm()).toBe(false);
      expect(service.showEditButton()).toBe(false);
      expect(service.isButtonDisabled()).toBe(true);
      expect(service.isRatingFormDisabled()).toBe(true);
      expect(service.canEdit()).toBe(false);
      expect(service.canRate()).toBe(false);
      expect(service.canOpenModal()).toBe(false);
      service.redoRating();
      expect(service.projectConfirmed()).toBe(rated);
      service.confirmRateProject();
      expect(execute).not.toHaveBeenCalled();
    },
  );

  it.each(["", "invalid"])("does not block evaluation for %s deadline", evaluation => {
    loadProgram(evaluation);
    service.initProject(project());
    expect(service.canRate()).toBe(true);
    expect(service.isRatingFormDisabled()).toBe(false);
  });

  it("applies fresh deadline changes without losing entered scores or adding timers", () => {
    service.initProject(project(true));
    service.redoRating();
    service.form().setValue({ score: 4 });
    loadProgram(past);
    expect(service.isRatingFormDisabled()).toBe(true);
    service.confirmRateProject();
    expect(execute).not.toHaveBeenCalled();
    loadProgram(future);
    expect(service.rateButtonText()).toBe("подтвердить изменения");
    expect(service.isRatingFormDisabled()).toBe(false);
    expect(service.form().getRawValue()).toEqual({ score: 4 });
    service.confirmRateProject();
    expect(execute).toHaveBeenCalledExactlyOnceWith(12, [], { score: 4 });
  });
});
