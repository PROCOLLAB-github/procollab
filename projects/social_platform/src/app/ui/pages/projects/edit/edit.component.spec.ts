/** @format */

import { ComponentFixture, DeferBlockBehavior, TestBed } from "@angular/core/testing";
import { ProjectEditComponent } from "./edit.component";
import { provideRouter } from "@angular/router";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { provideNgxMask } from "ngx-mask";
import { signal } from "@angular/core";
import { ProjectFormService } from "@api/project/facades/edit/project-form.service";
import { ProjectVacancyService } from "@api/project/facades/edit/project-vacancy.service";
import { ProjectVacancyUIService } from "@api/project/facades/edit/ui/project-vacancy-ui.service";
import { ProjectTeamService } from "@api/project/facades/edit/project-team.service";
import { ProjectTeamUIService } from "@api/project/facades/edit/ui/project-team-ui.service";
import { ProjectAdditionalService } from "@api/project/facades/edit/project-additional.service";
import { ProjectGoalService } from "@api/project/facades/edit/project-goals.service";
import { ProjectAchievementsService } from "@api/project/facades/edit/project-achievements.service";
import { ProjectPartnerService } from "@api/project/facades/edit/project-partner.service";
import { ProjectResourceService } from "@api/project/facades/edit/project-resources.service";
import { ProjectsEditInfoService } from "@api/project/facades/edit/projects-edit-info.service";
import { ProjectsEditUIInfoService } from "@api/project/facades/edit/ui/projects-edit-ui-info.service";
import { TooltipInfoService } from "@api/tooltip/tooltip-info.service";
import { ToggleFieldsInfoService } from "@api/toggle-fields/toggle-fields-info.service";
import { ProjectStepService } from "@api/project/project-step.service";
import { ProjectCoverResetService } from "@api/project/facades/edit/project-cover-reset.service";
import { ProjectAdditionalStepComponent } from "./components/project-additional-step/project-additional-step.component";

describe("ProjectEditComponent", () => {
  let component: ProjectEditComponent;
  let fixture: ComponentFixture<ProjectEditComponent>;

  beforeEach(async () => {
    const fb = new FormBuilder();
    const projectsEditInfoServiceSpy = {
      initializationEditInfo: vi.fn(),
      loadProgramTagsAndProject: vi.fn(),
      destroy: vi.fn(),
      deleteProject: vi.fn(),
      saveProjectAsPublished: vi.fn(),
      saveProjectAsDraft: vi.fn(),
      submitProjectForm: vi.fn(),
      closeSendingDescisionModal: vi.fn(),
      projectForm: fb.group({ name: [""] }),
      additionalForm: fb.group({}),
      profileId: signal(0),
      projSubmitInitiated: signal(false),
      projFormIsSubmittingAsPublished: signal(false),
      projFormIsSubmittingAsDraft: signal(false),
      isCompetitive: signal(false),
      submitted: signal(false),
    };

    const projectsEditUIInfoServiceSpy = {
      fromProgram: signal(false),
      fromProgramOpen: signal(false),
      isProjectAssignToProgram: signal(false),
      isProjectBoundToProgram: signal(false),
      isCompleted: signal(false),
      isSendDescisionLate: signal(false),
      isSendDescisionToPartnerProgramProject: signal(false),
      errorModalMessage: signal(""),
      onEditClicked: signal(false),
      warningModalSeen: signal(false),
      applyCloseWarningModal: vi.fn(),
    };

    const projectStepServiceSpy = {
      currentStep: signal(0),
      navigateToStep: vi.fn(),
    };

    const projectVacancyUIServiceSpy = {
      vacancyForm: fb.group({}),
    };

    const projectGoalServiceSpy = {
      reset: vi.fn(),
    };

    const emptySpy = { execute: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ProjectEditComponent],
      providers: [provideNgxMask(), provideRouter([])],
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
    })
      .overrideComponent(ProjectEditComponent, {
        remove: {
          providers: [
            ProjectCoverResetService,
            ProjectsEditInfoService,
            ProjectsEditUIInfoService,
            ProjectStepService,
            ProjectVacancyUIService,
            ProjectGoalService,
            ProjectFormService,
            ProjectVacancyService,
            ProjectTeamService,
            ProjectTeamUIService,
            ProjectAdditionalService,
            ProjectAchievementsService,
            ProjectPartnerService,
            ProjectResourceService,
            TooltipInfoService,
            ToggleFieldsInfoService,
          ],
        },
        add: {
          providers: [
            { provide: ProjectCoverResetService, useValue: { pending: signal(false) } },
            {
              provide: ProjectsEditInfoService,
              useValue: projectsEditInfoServiceSpy,
            },
            {
              provide: ProjectsEditUIInfoService,
              useValue: projectsEditUIInfoServiceSpy,
            },
            {
              provide: ProjectStepService,
              useValue: projectStepServiceSpy,
            },
            {
              provide: ProjectVacancyUIService,
              useValue: projectVacancyUIServiceSpy,
            },
            {
              provide: ProjectGoalService,
              useValue: projectGoalServiceSpy,
            },
            { provide: ProjectFormService, useValue: emptySpy },
            { provide: ProjectVacancyService, useValue: emptySpy },
            { provide: ProjectTeamService, useValue: emptySpy },
            { provide: ProjectTeamUIService, useValue: emptySpy },
            {
              provide: ProjectAdditionalService,
              useValue: { getAdditionalForm: () => projectsEditInfoServiceSpy.additionalForm },
            },
            { provide: ProjectAchievementsService, useValue: emptySpy },
            { provide: ProjectPartnerService, useValue: emptySpy },
            { provide: ProjectResourceService, useValue: emptySpy },
            { provide: TooltipInfoService, useValue: emptySpy },
            { provide: ToggleFieldsInfoService, useValue: emptySpy },
          ],
        },
      })
      .overrideComponent(ProjectAdditionalStepComponent, {
        set: {
          template: '<p data-testid="contest-fields">Дополнительные сведения</p>',
          imports: [],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("opens the selected contest fields while the browser has no idle time", async () => {
    vi.stubGlobal(
      "requestIdleCallback",
      vi.fn(() => 1),
    );
    vi.stubGlobal("cancelIdleCallback", vi.fn());
    try {
      fixture.debugElement.injector.get(ProjectStepService).currentStep.set("additional");
      fixture.detectChanges();
      await expect
        .poll(
          () => {
            fixture.detectChanges();
            return fixture.nativeElement.querySelector('[data-testid="contest-fields"]');
          },
          { timeout: 1000 },
        )
        .not.toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("на любом шаге блокирует сохранение старой обложки во время reset", () => {
    fixture.debugElement.injector.get(ProjectCoverResetService).pending.set(true);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll(".project__save app-button button");
    expect(buttons[1].disabled).toBe(true);
    expect(buttons[2].disabled).toBe(true);
  });

  it("uses canonical competition/submitted state for the primary action label", () => {
    const facade = fixture.debugElement.injector.get(ProjectsEditInfoService);
    // Mutable test signals stand in for the facade's canonical readonly signals.
    (facade.isCompetitive as ReturnType<typeof signal<boolean>>).set(true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll(".project__save app-button")[2].textContent,
    ).toContain("отправить заявку");
    (facade.submitted as ReturnType<typeof signal<boolean>>).set(true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll(".project__save app-button")[2].textContent.trim(),
    ).toBe("сохранить");
  });
});
