/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { RateProjectUseCase } from "@api/program/use-cases/rate-project.use-case";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { User } from "@domain/auth/user.model";
import { ProjectRate } from "@domain/project/project-rate";
import { fail, ok } from "@domain/shared/result.type";
import { of, Subject } from "rxjs";
import { RatingCardService } from "./rating-card.service";

describe("RatingCardService evaluation modes", () => {
  const user = Object.assign(new User(), { id: 7 });
  const expired = signal(false);
  const execute = vi.fn<RateProjectUseCase["execute"]>();
  let service: RatingCardService;

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
    expired.set(false);
    execute.mockReset().mockReturnValue(of(ok(undefined)));
    TestBed.configureTestingModule({
      providers: [
        RatingCardService,
        { provide: RateProjectUseCase, useValue: { execute } },
        {
          provide: ProgramDetailMainUIInfoService,
          useValue: { registerDateExpired: expired, program: signal(null) },
        },
        { provide: ProfileInfoService, useValue: { profile: signal(user) } },
        { provide: LoggerService, useValue: { error: vi.fn() } },
      ],
    });
    service = TestBed.inject(RatingCardService);
  });

  it("starts with create mode and returns to readonly after the first successful rating", () => {
    service.initProject(project());
    expect(service.rateButtonText()).toBe("оценить проект");
    expect(service.showRatingForm()).toBe(true);
    service.confirmRateProject();
    expect(service.projectConfirmed()).toBe(true);
    expect(service.rateButtonText()).toBe("проект оценён");
    expect(service.showRatingForm()).toBe(false);
    expect(service.showEditButton()).toBe(true);
    expect(service.ratedCount()).toBe(1);
  });

  it("keeps editing until update succeeds, then returns to readonly without incrementing count", () => {
    const response = new Subject<ReturnType<typeof ok<void>>>();
    execute.mockReturnValue(response);
    service.initProject(project(true));
    expect(service.rateButtonText()).toBe("проект оценён");
    service.redoRating();
    service.form().setValue({ score: 4 });
    expect(service.rateButtonText()).toBe("подтвердить изменения");
    expect(service.showRatingForm()).toBe(true);
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
    expect(service.rateButtonText()).toBe("проект оценён");
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
    expect(service.rateButtonText()).toBe("проект оценён");
  });

  it("preserves closed-program and rating-limit restrictions", () => {
    service.initProject({ ...project(), ratedCount: 1 });
    expect(service.rateButtonText()).toBe("лимит оценок достигнут");
    expect(service.isButtonDisabled()).toBe(true);
    expired.set(true);
    expect(service.rateButtonText()).toBe("программа завершена");
    expect(service.canOpenModal()).toBe(false);
  });
});
