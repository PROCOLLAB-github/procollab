/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RatingCardComponent } from "./rating-card.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { of } from "rxjs";
import { signal } from "@angular/core";
import { ProjectRatingRepositoryPort } from "@domain/project/ports/project-rating.repository.port";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { By } from "@angular/platform-browser";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { RateProjectUseCase } from "@api/program/use-cases/rate-project.use-case";
import { Program } from "@domain/program/program.model";
import { ProjectRate } from "@domain/project/project-rate";
import { User } from "@domain/auth/user.model";
import { ok } from "@domain/shared/result.type";
import { ProjectRatingComponent } from "./project-rating/project-rating.component";

describe("RatingCardComponent", () => {
  let component: RatingCardComponent;
  let fixture: ComponentFixture<RatingCardComponent>;
  const user = Object.assign(new User(), { id: 7 });
  const execute = vi.fn<RateProjectUseCase["execute"]>();
  const past = "2026-09-01T00:00:00Z";
  const future = "2026-09-30T00:00:00Z";

  function render(rated = false, evaluation = future, registration = past): void {
    TestBed.inject(ProgramDetailMainUIInfoService).applyFormatingProgramData({
      ...Program.default(),
      datetimeRegistrationEnds: registration,
      datetimeEvaluationEnds: evaluation,
    });
    const project: ProjectRate = {
      id: 12,
      name: "Project",
      leader: 9,
      description: "",
      imageAddress: "",
      presentationAddress: "",
      region: "",
      viewsCount: 0,
      industry: 1,
      scored: rated,
      scoredExpertId: rated ? user.id : null,
      ratedExperts: rated ? [user] : [],
      ratedCount: rated ? 1 : 0,
      maxRates: 1,
      criterias: [
        {
          id: 1,
          name: "Score",
          description: "",
          type: "int",
          value: 2,
          minValue: 0,
          maxValue: 5,
          expertId: user.id,
        },
        {
          id: 2,
          name: "Confirmed",
          description: "",
          type: "bool",
          value: "true",
          minValue: null,
          maxValue: null,
          expertId: user.id,
        },
        {
          id: 3,
          name: "Comment",
          description: "",
          type: "str",
          value: "Note",
          minValue: null,
          maxValue: null,
          expertId: user.id,
        },
      ],
    };
    fixture.componentRef.setInput("project", project);
    fixture.detectChanges();
  }

  const cta = () =>
    fixture.nativeElement.querySelector(".card__rated app-button button") as HTMLButtonElement;
  const criteria = () =>
    fixture.debugElement.query(By.directive(ProjectRatingComponent))
      .componentInstance as ProjectRatingComponent;

  function expectReadonly(disabled: boolean): void {
    expect(criteria().disabled).toBe(disabled);
    for (const control of Object.values(criteria().form.controls))
      expect(control.disabled).toBe(disabled);
    const root = fixture.nativeElement as HTMLElement;
    expect(
      root.querySelector<HTMLInputElement>('app-project-rating input[type="number"]')!.disabled,
    ).toBe(disabled);
    expect(root.querySelector<HTMLTextAreaElement>("app-project-rating textarea")!.disabled).toBe(
      disabled,
    );
  }

  beforeEach(async () => {
    vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-09-09T12:00:00Z"));
    execute.mockReset().mockReturnValue(of(ok(undefined)));
    const projectRatingSpy = { getAll: vi.fn(), postFilters: vi.fn(), rate: vi.fn() };

    const authPortSpy = {
      fetchProfile: of({}),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
    };

    const industrySpy = {
      industries: signal([]),
      getAll: () => of([]),
      getOne: () => undefined,
    };

    await TestBed.configureTestingModule({
      imports: [RatingCardComponent, HttpClientTestingModule],
      providers: [
        { provide: ProjectRatingRepositoryPort, useValue: projectRatingSpy },
        ProgramDetailMainUIInfoService,
        { provide: ProfileInfoService, useValue: { profile: signal(user) } },
        { provide: RateProjectUseCase, useValue: { execute } },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        { provide: IndustryRepositoryPort, useValue: industrySpy },
        {
          provide: ProjectSubscriptionRepositoryPort,
          useValue: { getSubscriptions: of({ results: [], count: 0 }) },
        },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  afterEach(() => vi.restoreAllMocks());

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("keeps unrated CTA active and criteria editable when registration is past but evaluation is future", () => {
    render();
    expect(TestBed.inject(ProgramDetailMainUIInfoService).registerDateExpired()).toBe(true);
    expect(cta()).not.toBeNull();
    expect(cta().textContent).toContain("оценить проект");
    expect(cta().disabled).toBe(false);
    expectReadonly(false);
  });

  it("allows editing an existing rating until the evaluation deadline, then returns to readonly on success", async () => {
    render(true);
    expect(cta().textContent).toContain("проект оценён");
    expectReadonly(true);
    const edit = fixture.nativeElement.querySelector(
      ".card__rated--icon button",
    ) as HTMLButtonElement;
    expect(edit.disabled).toBe(false);
    edit.click();
    fixture.detectChanges();
    expect(cta().textContent).toContain("подтвердить изменения");
    expect(cta().disabled).toBe(false);
    expectReadonly(false);
    criteria().form.get("1")!.setValue(4);
    cta().click();
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    document.querySelector<HTMLButtonElement>(".cancel__button button")!.click();
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(execute).toHaveBeenCalledOnce();
    expect(execute.mock.calls[0][2]).toEqual({ 1: 4, 2: true, 3: "Note" });
    expect(cta().textContent).toContain("проект оценён");
    expectReadonly(true);
  });

  it.each([false, true])(
    "keeps expired CTA visible and all criteria readonly (rated=%s)",
    rated => {
      render(rated, past, future);
      expect(cta()).not.toBeNull();
      expect(cta().textContent).toContain("оценивание завершено");
      expect(cta().disabled).toBe(true);
      expect(
        fixture.nativeElement.querySelector(".card__rated app-button").getAttribute("title"),
      ).toBe("Срок оценивания завершён");
      expect(fixture.nativeElement.querySelector(".card__rated--icon")).toBeNull();
      expectReadonly(true);
      cta().click();
      fixture.detectChanges();
      expect(execute).not.toHaveBeenCalled();
    },
  );

  it.each(["", "invalid"])("keeps CTA and criteria available for %s deadline", evaluation => {
    render(false, evaluation);
    expect(cta().disabled).toBe(false);
    expect(cta().textContent).toContain("оценить проект");
    expectReadonly(false);
  });

  it("updates visible CTA and criteria on fresh closed/reopened program responses", () => {
    render();
    const ui = TestBed.inject(ProgramDetailMainUIInfoService);
    ui.applyFormatingProgramData({ ...ui.program()!, datetimeEvaluationEnds: past });
    fixture.detectChanges();
    expect(cta().textContent).toContain("оценивание завершено");
    expectReadonly(true);
    ui.applyFormatingProgramData({ ...ui.program()!, datetimeEvaluationEnds: future });
    fixture.detectChanges();
    expect(cta().textContent).toContain("оценить проект");
    expect(cta().disabled).toBe(false);
    expectReadonly(false);
  });
});
