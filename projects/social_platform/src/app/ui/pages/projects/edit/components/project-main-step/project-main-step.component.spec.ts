/** @format */

import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormArray, FormBuilder } from "@angular/forms";
import { provideRouter } from "@angular/router";
import { of } from "rxjs";
import { provideNgxMask } from "ngx-mask";
import { ProjectContactsService } from "@api/project/facades/edit/project-contacts.service";
import { ProjectFormService } from "@api/project/facades/edit/project-form.service";
import { ProjectsEditInfoService } from "@api/project/facades/edit/projects-edit-info.service";
import { ProjectsEditUIInfoService } from "@api/project/facades/edit/ui/projects-edit-ui-info.service";
import { ProjectGoalsUIService } from "@api/project/facades/edit/ui/project-goals-ui.service";
import { ProjectGoalService } from "@api/project/facades/edit/project-goals.service";
import { ProjectTeamUIService } from "@api/project/facades/edit/ui/project-team-ui.service";
import { ProjectMainStepComponent } from "./project-main-step.component";

describe("ProjectMainStepComponent", () => {
  let fixture: ComponentFixture<ProjectMainStepComponent>;
  let links: FormArray;

  beforeEach(async () => {
    const fb = new FormBuilder();
    const projectForm = fb.group({ links: fb.array([]), link: [""] });
    const emptyProjectControls = {
      name: null,
      region: null,
      industry: null,
      description: null,
      actuality: null,
      implementationDeadline: null,
      problem: null,
      targetAudience: null,
      trl: null,
      partnerProgramId: null,
      presentationAddress: null,
      coverImageAddress: null,
      imageAddress: null,
    };
    links = projectForm.get("links") as FormArray;

    await TestBed.configureTestingModule({
      imports: [ProjectMainStepComponent],
      providers: [
        provideRouter([]),
        provideNgxMask(),
        ProjectContactsService,
        {
          provide: ProjectFormService,
          useValue: {
            getForm: () => projectForm,
            editIndex: signal<number | null>(null),
            ...emptyProjectControls,
          },
        },
        {
          provide: ProjectsEditInfoService,
          useValue: { projectForm, profileId: signal(1), industries$: of([]) },
        },
        {
          provide: ProjectsEditUIInfoService,
          useValue: { leaderId: signal<number | null>(null) },
        },
        {
          provide: ProjectGoalService,
          useValue: {
            getForm: () => fb.group({}),
            goals: fb.array([]),
            goalName: null,
            goalDate: null,
            goalLeader: null,
          },
        },
        {
          provide: ProjectGoalsUIService,
          useValue: {
            hasGoals: signal(false),
            goalItems: signal([]),
            goalLeaderShowModal: signal(false),
            activeGoalIndex: signal<number | null>(null),
            selectedLeaderId: signal<number | null>(null),
          },
        },
        {
          provide: ProjectTeamUIService,
          useValue: { collaborators: signal([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectMainStepComponent);
    fixture.detectChanges();
  });

  it("renders every new project contact input immediately", () => {
    const addButton = Array.from(fixture.nativeElement.querySelectorAll("app-button")).find(
      (button: Element) => button.textContent?.includes("добавить ссылку"),
    ) as HTMLElement;

    addButton.click();
    fixture.detectChanges();
    expect(links.length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('[formarrayname="links"] app-input')).toHaveLength(
      1,
    );

    addButton.click();
    fixture.detectChanges();
    expect(links.length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('[formarrayname="links"] app-input')).toHaveLength(
      2,
    );
  });
});
