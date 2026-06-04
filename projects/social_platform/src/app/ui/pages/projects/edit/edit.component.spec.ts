/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
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
    };

    const projectsEditUIInfoServiceSpy = {
      fromProgram: signal(false),
      fromProgramOpen: signal(false),
      isCompetitive: signal(false),
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
    })
      .overrideComponent(ProjectEditComponent, {
        remove: {
          providers: [
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
            { provide: ProjectAdditionalService, useValue: emptySpy },
            { provide: ProjectAchievementsService, useValue: emptySpy },
            { provide: ProjectPartnerService, useValue: emptySpy },
            { provide: ProjectResourceService, useValue: emptySpy },
            { provide: TooltipInfoService, useValue: emptySpy },
            { provide: ToggleFieldsInfoService, useValue: emptySpy },
          ],
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
});
