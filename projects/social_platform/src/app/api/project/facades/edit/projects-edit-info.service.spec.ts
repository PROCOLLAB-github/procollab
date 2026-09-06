/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, provideRouter, Router } from "@angular/router";
import { BehaviorSubject, of, Subject } from "rxjs";
import { NavService } from "@api/shared/nav.service";
import { SearchesService } from "@api/searches/searches.service";
import { ProjectStepService } from "@api/project/project-step.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProjectProgramRepositoryPort } from "@domain/project/ports/project-program.repository.port";
import { programLinkFields } from "@domain/project/program-link-fields.fixture";
import { ProgramLinkFields } from "@domain/project/program-link-fields.model";
import { Project } from "@domain/project/project.model";
import { ok } from "@domain/shared/result.type";
import { AssignProjectProgramUseCase } from "@api/program/use-cases/assign-project-program";
import { DeleteProjectUseCase } from "../../use-cases/delete-project.use-case";
import { UpdateFormUseCase } from "../../use-cases/update-form.use-case";
import { ProjectAdditionalService } from "./project-additional.service";
import { ProjectFormService } from "./project-form.service";
import { ProjectGoalService } from "./project-goals.service";
import { ProjectPartnerService } from "./project-partner.service";
import { ProjectResourceService } from "./project-resources.service";
import { ProjectAchievementsService } from "./project-achievements.service";
import { ProjectContactsService } from "./project-contacts.service";
import { ProjectVacancyService } from "./project-vacancy.service";
import { ProjectsEditUIInfoService } from "./ui/projects-edit-ui-info.service";
import { ProjectVacancyUIService } from "./ui/project-vacancy-ui.service";
import { ProjectTeamUIService } from "./ui/project-team-ui.service";
import { ProjectsEditInfoService } from "./projects-edit-info.service";

describe("ProjectsEditInfoService canonical relation integration", () => {
  let service: ProjectsEditInfoService;
  let additional: ProjectAdditionalService;
  let params: BehaviorSubject<{ projectId: string }>;
  let query: BehaviorSubject<Record<string, unknown>>;
  let data: BehaviorSubject<Record<string, unknown>>;
  const repo = { getProgramLinkFields: vi.fn(), updateProgramLinkFields: vi.fn() };
  const programRepo = { submitCompettetiveProject: vi.fn() };
  const update = { execute: vi.fn() };
  const step = { currentStep: signal("additional"), setStepFromRoute: vi.fn() };
  const ui = {
    leaderId: signal(1),
    isCompetitive: signal(false),
    isProjectAssignToProgram: signal(false),
    fromProgram: signal(""),
    fromProgramOpen: signal(false),
    applySendDescision: vi.fn(),
    applyCloseSendDescisionModal: vi.fn(),
  };
  function project(id = 55): Project {
    // The embedded legacy program is deliberately B. Explicit route link A is authoritative.
    return {
      id,
      partnerProgram: {
        programId: 99,
        programLinkId: 900,
        canSubmit: true,
        programFields: [{ name: "legacy", options: ["WRONG PROGRAM"] }],
        programFieldValues: [{ fieldName: "case", value: "WRONG PROGRAM" }],
      },
      collaborators: [],
      vacancies: [],
    } as unknown as Project;
  }

  beforeEach(() => {
    const fb = new FormBuilder();
    const form = fb.group({ draft: [true], name: ["Project"], partnerProgramId: [12] });
    params = new BehaviorSubject({ projectId: "55" });
    query = new BehaviorSubject<Record<string, unknown>>({
      programLinkId: "700",
      fromProgram: true,
    });
    data = new BehaviorSubject<Record<string, unknown>>({ data: [project(), [], [], [], []] });
    repo.getProgramLinkFields.mockReset().mockReturnValue(of(programLinkFields()));
    repo.updateProgramLinkFields.mockReset().mockReturnValue(of(undefined));
    programRepo.submitCompettetiveProject.mockReset().mockReturnValue(of({}));
    update.execute.mockReset().mockReturnValue(of(ok(project())));
    ui.applySendDescision.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        ProjectsEditInfoService,
        ProjectAdditionalService,
        {
          provide: ActivatedRoute,
          useValue: {
            params,
            queryParams: query,
            data,
            snapshot: {
              params: { projectId: "55" },
              paramMap: { get: () => "55" },
              queryParams: query.value,
            },
          },
        },
        { provide: NavService, useValue: { setNavTitle: vi.fn() } },
        { provide: SearchesService, useValue: { inlineSkills: signal([]) } },
        { provide: ProjectStepService, useValue: step },
        { provide: LoggerService, useValue: { error: vi.fn() } },
        { provide: SnackbarService, useValue: { error: vi.fn(), success: vi.fn() } },
        { provide: IndustryRepositoryPort, useValue: { industries: signal([]) } },
        { provide: SkillsRepositoryPort, useValue: { getSkillsNested: () => of([]) } },
        {
          provide: ProjectFormService,
          useValue: {
            getForm: () => form,
            getFormValue: () => form.value,
            achievements: fb.array([]),
            links: fb.array([]),
            initializeProjectData: vi.fn(),
            clearAllValidationErrors: vi.fn(),
          },
        },
        {
          provide: ProjectAchievementsService,
          useValue: { syncAchievementsItems: vi.fn(), clearAllAchievementsErrors: vi.fn() },
        },
        { provide: ProjectContactsService, useValue: { syncLinksItems: vi.fn() } },
        {
          provide: ProjectGoalService,
          useValue: { goals: fb.array([]), initializeGoalsFromProject: vi.fn() },
        },
        {
          provide: ProjectPartnerService,
          useValue: { partners: fb.array([]), initializePartnerFromProject: vi.fn() },
        },
        {
          provide: ProjectResourceService,
          useValue: { resources: fb.array([]), initializeResourcesFromProject: vi.fn() },
        },
        {
          provide: ProjectTeamUIService,
          useValue: { applySetInvites: vi.fn(), applySetCollaborators: vi.fn() },
        },
        {
          provide: ProjectVacancyUIService,
          useValue: {
            applySetVacancies: vi.fn(),
            isDirty: () => false,
            applyValidateForm: () => false,
          },
        },
        { provide: ProjectVacancyService, useValue: {} },
        { provide: ProjectsEditUIInfoService, useValue: ui },
        { provide: AssignProjectProgramUseCase, useValue: {} },
        { provide: DeleteProjectUseCase, useValue: {} },
        { provide: UpdateFormUseCase, useValue: update },
        { provide: ProjectProgramRepositoryPort, useValue: repo },
        { provide: ProgramRepositoryPort, useValue: programRepo },
      ],
    });
    vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    service = TestBed.inject(ProjectsEditInfoService);
    additional = TestBed.inject(ProjectAdditionalService);
  });

  it("initializes from GET A, not embedded B, and fromProgram reload never chooses a case", () => {
    service.loadProgramTagsAndProject();
    expect(repo.getProgramLinkFields).toHaveBeenCalledExactlyOnceWith(700);
    expect(service.additionalForm).toBe(additional.getAdditionalForm());
    expect(service.additionalForm.get("case")?.value).toBe("");
    expect(service.additionalForm.get("legacy")).toBeNull();
    query.next({ ...query.value, editingStep: "main" });
    expect(repo.getProgramLinkFields).toHaveBeenCalledTimes(1);
  });

  it("draft without case PUTs only A and continues project save", () => {
    service.loadProgramTagsAndProject();
    service.saveProjectAsDraft();
    expect(repo.updateProgramLinkFields.mock.calls[0][0]).toBe(700);
    expect(
      repo.updateProgramLinkFields.mock.calls[0][1].some(
        (value: { fieldId: number }) => value.fieldId === 5,
      ),
    ).toBe(false);
    expect(update.execute).toHaveBeenCalledOnce();
    expect(programRepo.submitCompettetiveProject).not.toHaveBeenCalled();
  });

  it("empty case blocks publish; selected case PUT/submit both use A", () => {
    service.loadProgramTagsAndProject();
    service.saveProjectAsPublished();
    expect(service.additionalForm.get("case")?.touched).toBe(true);
    expect(repo.updateProgramLinkFields).not.toHaveBeenCalled();
    expect(programRepo.submitCompettetiveProject).not.toHaveBeenCalled();
    service.additionalForm.get("case")?.setValue("B");
    service.saveProjectAsPublished();
    expect(ui.applySendDescision).toHaveBeenCalledOnce();
    service.closeSendingDescisionModal();
    expect(repo.updateProgramLinkFields.mock.calls[0][0]).toBe(700);
    expect(programRepo.submitCompettetiveProject).toHaveBeenCalledExactlyOnceWith(700);
    expect(update.execute).toHaveBeenCalledOnce();
  });

  it("mismatched GET project blocks draft PUT and main save", () => {
    repo.getProgramLinkFields.mockReturnValue(of(programLinkFields({ projectId: 99 })));
    service.loadProgramTagsAndProject();
    service.saveProjectAsDraft();
    expect(additional.loadFailed()).toBe(true);
    expect(repo.updateProgramLinkFields).not.toHaveBeenCalled();
    expect(update.execute).not.toHaveBeenCalled();
  });

  it("submitted additional form does not block main save or trigger another fields PUT", () => {
    const snapshot = programLinkFields({ submitted: true });
    snapshot.fields[0].value = "B";
    repo.getProgramLinkFields.mockReturnValue(of(snapshot));
    service.loadProgramTagsAndProject();
    service.saveProjectAsPublished();
    expect(service.additionalForm.disabled).toBe(true);
    expect(repo.updateProgramLinkFields).not.toHaveBeenCalled();
    expect(programRepo.submitCompettetiveProject).not.toHaveBeenCalled();
    expect(update.execute).toHaveBeenCalledOnce();
  });

  it("query-only relation change cancels old GET and uses exact new link", () => {
    const old = new Subject<ProgramLinkFields>();
    repo.getProgramLinkFields
      .mockReturnValueOnce(old)
      .mockReturnValue(of(programLinkFields({ programLinkId: 800, fields: [] })));
    service.loadProgramTagsAndProject();
    query.next({ programLinkId: "800" });
    expect(old.observed).toBe(false);
    old.next(programLinkFields());
    expect(repo.getProgramLinkFields.mock.calls).toEqual([[700], [800]]);
    expect(service.activeProgramLinkId()).toBe(800);
    expect(additional.partnerProgramFields()).toEqual([]);
  });

  it("route project change waits for matching resolver data and cancels old GET immediately", () => {
    const old = new Subject<ProgramLinkFields>();
    repo.getProgramLinkFields
      .mockReturnValueOnce(old)
      .mockReturnValue(of(programLinkFields({ projectId: 56 })));
    service.loadProgramTagsAndProject();
    params.next({ projectId: "56" });
    expect(old.observed).toBe(false);
    expect(service.activeProgramLinkId()).toBeNull();
    expect(repo.getProgramLinkFields).toHaveBeenCalledTimes(1);
    data.next({ data: [project(56), [], [], [], []] });
    expect(repo.getProgramLinkFields).toHaveBeenCalledTimes(2);
    expect(service.activeProgramLinkId()).toBe(700);
  });
});
