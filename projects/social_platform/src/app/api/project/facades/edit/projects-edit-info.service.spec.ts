/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, provideRouter, Router } from "@angular/router";
import { BehaviorSubject, of, Subject, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
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
  const assign = { execute: vi.fn() };
  const step = { currentStep: signal("additional"), setStepFromRoute: vi.fn() };
  const ui = {
    leaderId: signal(1),
    isProjectAssignToProgram: signal(false),
    fromProgram: signal(""),
    fromProgramOpen: signal(false),
    applySendDescision: vi.fn(),
    applyCloseSendDescisionModal: vi.fn(),
    applyOpenSendDescisionLateModal: vi.fn(),
    applyOpenAssignProjectModal: vi.fn(),
  };
  function project(id = 55): Project {
    // The embedded legacy program is deliberately B. Explicit route link A is authoritative.
    return {
      id,
      partnerProgram: {
        programId: 99,
        programLinkId: 900,
        canSubmit: false,
        programFields: [{ name: "legacy", options: ["WRONG PROGRAM"] }],
        programFieldValues: [{ fieldName: "case", value: "WRONG PROGRAM" }],
      },
      collaborators: [],
      vacancies: [],
    } as unknown as Project;
  }

  beforeEach(() => {
    const fb = new FormBuilder();
    const form = fb.group({ draft: [true], name: ["Project"], partnerProgramId: [99] });
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
    assign.execute.mockReset().mockReturnValue(of(ok({ newProjectId: 55 })));
    ui.applySendDescision.mockClear();
    ui.applyCloseSendDescisionModal.mockClear();
    ui.applyOpenSendDescisionLateModal.mockClear();
    ui.applyOpenAssignProjectModal.mockClear();
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
        { provide: AssignProjectProgramUseCase, useValue: assign },
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
    expect(update.execute).toHaveBeenCalledWith({ id: 55, data: { name: "Project", draft: true } });
    expect(service.projectForm.get("partnerProgramId")?.value).toBe(99);
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
    expect(service.isCompetitive()).toBe(true);
    expect(update.execute).toHaveBeenCalledWith({
      id: 55,
      data: { name: "Project", draft: false },
    });
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

  function legacyBAllowsSubmission(): void {
    const legacy = project();
    legacy.partnerProgram.canSubmit = true;
    data.next({ data: [legacy, [], [], [], []] });
  }

  it("closed canonical A does not publish or send any fields even if legacy B allows submission", () => {
    legacyBAllowsSubmission();
    repo.getProgramLinkFields.mockReturnValue(
      of(programLinkFields({ submissionOpen: false, canSubmit: false })),
    );
    service.loadProgramTagsAndProject();
    service.additionalForm.get("case")?.setValue("B");
    service.saveProjectAsPublished();
    expect(service.isCompetitive()).toBe(true);
    expect(ui.applyOpenSendDescisionLateModal).toHaveBeenCalledOnce();
    expect(ui.applySendDescision).not.toHaveBeenCalled();
    expect(repo.updateProgramLinkFields).not.toHaveBeenCalled();
    expect(programRepo.submitCompettetiveProject).not.toHaveBeenCalled();
    expect(update.execute).not.toHaveBeenCalled();
    expect(TestBed.inject(SnackbarService).success).not.toHaveBeenCalled();
    expect(service.projectForm.get("draft")?.value).toBe(true);
  });

  it("noncompetitive canonical A saves normally without submit despite legacy B", () => {
    legacyBAllowsSubmission();
    repo.getProgramLinkFields.mockReturnValue(
      of(programLinkFields({ isCompetitive: false, canSubmit: false })),
    );
    service.loadProgramTagsAndProject();
    service.additionalForm.get("case")?.setValue("B");
    service.saveProjectAsPublished();
    expect(service.isCompetitive()).toBe(false);
    expect(ui.applySendDescision).not.toHaveBeenCalled();
    expect(repo.updateProgramLinkFields).toHaveBeenCalledExactlyOnceWith(700, [
      { fieldId: 5, valueText: "B" },
      { fieldId: 6, valueText: "Y" },
      { fieldId: 7, valueText: "" },
      { fieldId: 8, valueText: "false" },
    ]);
    expect(programRepo.submitCompettetiveProject).not.toHaveBeenCalled();
    expect(update.execute).toHaveBeenCalledExactlyOnceWith({
      id: 55,
      data: { name: "Project", draft: false },
    });
  });

  it("single-link happy path: validation, confirmation, PUT, submit, main save and success exactly once", () => {
    const single = project();
    single.partnerProgram.programId = 12;
    single.partnerProgram.programLinkId = 700;
    data.next({ data: [single, [], [], [], []] });
    query.next({}); // Exercise the single-link backward-compatible ID fallback.
    service.projectForm.get("partnerProgramId")?.setValue(12);
    const put = new Subject<void>();
    const submission = new Subject<unknown>();
    repo.updateProgramLinkFields.mockReturnValue(put);
    programRepo.submitCompettetiveProject.mockReturnValue(submission);
    service.loadProgramTagsAndProject();
    service.additionalForm.get("case")?.setValue("B");
    service.saveProjectAsPublished();
    expect(ui.applySendDescision).toHaveBeenCalledOnce();
    expect(repo.updateProgramLinkFields).not.toHaveBeenCalled();
    service.closeSendingDescisionModal();
    expect(repo.updateProgramLinkFields).toHaveBeenCalledTimes(1);
    expect(repo.updateProgramLinkFields.mock.calls[0][0]).toBe(700);
    expect(programRepo.submitCompettetiveProject).not.toHaveBeenCalled();
    expect(update.execute).not.toHaveBeenCalled();
    put.next();
    put.complete();
    expect(programRepo.submitCompettetiveProject).toHaveBeenCalledExactlyOnceWith(700);
    expect(update.execute).not.toHaveBeenCalled();
    submission.next({});
    submission.complete();
    expect(update.execute).toHaveBeenCalledExactlyOnceWith({
      id: 55,
      data: { name: "Project", draft: false },
    });
    expect(service.projectForm.get("partnerProgramId")?.value).toBe(12);
    expect(additional.submitted()).toBe(true);
    expect(additional.canSubmit()).toBe(false);
    expect(TestBed.inject(SnackbarService).success).toHaveBeenCalledExactlyOnceWith(
      "данные успешно сохранены",
    );
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledOnce();
  });

  it("excludes binding from a new ordinary payload without mutating the raw value or control", () => {
    service.loadProgramTagsAndProject();
    const raw = Object.freeze({ name: "Project", draft: true, partnerProgramId: 99 });
    vi.spyOn(TestBed.inject(ProjectFormService), "getFormValue").mockReturnValue(raw);
    service.saveProjectAsDraft();
    expect(update.execute).toHaveBeenCalledExactlyOnceWith({
      id: 55,
      data: { name: "Project", draft: true },
    });
    expect(raw.partnerProgramId).toBe(99);
    expect(service.projectForm.get("partnerProgramId")?.value).toBe(99);
  });

  it("preserves ordinary payload semantics without canonical context", () => {
    data.next({ data: [{ ...project(), partnerProgram: null }, [], [], [], []] });
    query.next({});
    service.loadProgramTagsAndProject();
    service.saveProjectAsDraft();
    expect(additional.activeProgramLinkId()).toBeNull();
    expect(repo.getProgramLinkFields).not.toHaveBeenCalled();
    expect(update.execute).toHaveBeenCalledExactlyOnceWith({
      id: 55,
      data: { name: "Project", draft: true, partnerProgramId: 99 },
    });
  });

  it("preserves the explicit dedicated assignment action and its selected program ID", () => {
    service.loadProgramTagsAndProject();
    vi.spyOn(TestBed.inject(Router), "navigate").mockResolvedValue(true);
    service.assignProjectToProgram();
    expect(assign.execute).toHaveBeenCalledExactlyOnceWith(55, 99);
    expect(ui.applyOpenAssignProjectModal).toHaveBeenCalledOnce();
    expect(update.execute).not.toHaveBeenCalled();
  });

  it("backend deadline race keeps late modal, refreshes metadata and blocks another submission", () => {
    service.loadProgramTagsAndProject();
    service.additionalForm.get("case")?.setValue("B");
    service.additionalForm.get("note")?.setValue("local note");
    const reload = new Subject<ProgramLinkFields>();
    repo.getProgramLinkFields.mockReturnValue(reload);
    programRepo.submitCompettetiveProject.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { detail: "Срок подачи проектов в программу завершён." },
          }),
      ),
    );
    service.saveProjectAsPublished();
    service.closeSendingDescisionModal();
    expect(repo.updateProgramLinkFields).toHaveBeenCalledOnce();
    expect(programRepo.submitCompettetiveProject).toHaveBeenCalledExactlyOnceWith(700);
    expect(ui.applyOpenSendDescisionLateModal).toHaveBeenCalledOnce();
    expect(update.execute).not.toHaveBeenCalled();
    expect(TestBed.inject(SnackbarService).success).not.toHaveBeenCalled();
    expect(service.projFormIsSubmitting$().status).toBe("failure");
    expect(repo.getProgramLinkFields.mock.calls).toEqual([[700], [700]]);
    expect(additional.activeProgramLinkId()).toBeNull();
    service.saveProjectAsPublished(); // A pending canonical refresh cannot submit either.
    reload.next(programLinkFields({ submissionOpen: false, canSubmit: false }));
    reload.complete();
    expect(additional.submissionOpen()).toBe(false);
    expect(additional.canSubmit()).toBe(false);
    expect(service.additionalForm.get("case")?.value).toBe("B");
    expect(service.additionalForm.get("note")?.value).toBe("local note");
    service.saveProjectAsPublished();
    expect(ui.applyOpenSendDescisionLateModal).toHaveBeenCalledTimes(2);
    expect(ui.applySendDescision).toHaveBeenCalledOnce();
    expect(repo.updateProgramLinkFields).toHaveBeenCalledOnce();
    expect(programRepo.submitCompettetiveProject).toHaveBeenCalledExactlyOnceWith(700);
    expect(update.execute).not.toHaveBeenCalled();
    expect(TestBed.inject(SnackbarService).success).not.toHaveBeenCalled();
  });

  it.each([
    ["submit", "Проект уже был сдан на проверку."],
    ["put", "Нельзя изменять значения полей программы после сдачи проекта на проверку."],
  ])(
    "already-submitted %s race refreshes read-only state without main save or success",
    (source, detail) => {
      service.loadProgramTagsAndProject();
      service.additionalForm.get("case")?.setValue("B");
      const frozen = programLinkFields({ submitted: true, canSubmit: false });
      frozen.fields[0].value = "B";
      repo.getProgramLinkFields.mockReturnValue(of(frozen));
      (source === "put"
        ? repo.updateProgramLinkFields
        : programRepo.submitCompettetiveProject
      ).mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 400,
              error: { detail },
            }),
        ),
      );
      service.saveProjectAsPublished();
      service.closeSendingDescisionModal();
      expect(repo.getProgramLinkFields.mock.calls).toEqual([[700], [700]]);
      expect(service.additionalForm.disabled).toBe(true);
      expect(additional.submitted()).toBe(true);
      expect(update.execute).not.toHaveBeenCalled();
      expect(TestBed.inject(SnackbarService).success).not.toHaveBeenCalled();
      expect(service.projFormIsSubmitting$().status).toBe("failure");
      expect(repo.updateProgramLinkFields).toHaveBeenCalledOnce();
      expect(programRepo.submitCompettetiveProject).toHaveBeenCalledTimes(source === "put" ? 0 : 1);
    },
  );
});
