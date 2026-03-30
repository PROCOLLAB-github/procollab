/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { NavService } from "@ui/services/nav/nav.service";
import {
  EMPTY,
  distinctUntilChanged,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";
import { Project } from "@domain/project/project.model";
import { ActivatedRoute, Router } from "@angular/router";
import { Goal } from "@domain/project/goals.model";
import { Partner } from "@domain/project/partner.model";
import { Resource } from "@domain/project/resource.model";
import { Invite } from "@domain/invite/invite.model";
import { HttpErrorResponse } from "@angular/common/http";
import { ValidationService } from "@corelib";
import { SnackbarService } from "@ui/services/snackbar/snackbar.service";
import { EditStep, ProjectStepService } from "../../project-step.service";
import { toObservable } from "@angular/core/rxjs-interop";
import { SkillsRepositoryPort as SkillsService } from "@domain/skills/ports/skills.repository.port";
import { ProjectFormService } from "./project-form.service";
import { ProjectGoalService } from "./project-goals.service";
import { ProjectPartnerService } from "./project-partner.service";
import { ProjectResourceService } from "./project-resources.service";
import { ProjectAchievementsService } from "./project-achievements.service";
import { ProjectAdditionalService } from "./project-additional.service";
import { SkillsInfoService } from "../../../skills/facades/skills-info.service";
import { ProjectsEditUIInfoService } from "./ui/projects-edit-ui-info.service";
import { ProjectVacancyUIService } from "./ui/project-vacancy-ui.service";
import { ProjectTeamUIService } from "./ui/project-team-ui.service";
import { ProjectContactsService } from "./project-contacts.service";
import { ProjectVacancyService } from "./project-vacancy.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { AssignProjectProgramUseCase } from "../../../program/use-cases/assign-project-program";
import { DeleteProjectUseCase } from "../../use-case/delete-project.use-case";
import { UpdateFormUseCase } from "../../use-case/update-form.use-case";
import {
  AsyncState,
  failure,
  initial,
  isLoading,
  loading,
  success,
} from "@domain/shared/async-state";

@Injectable()
export class ProjectsEditInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly skillsInfoService = inject(SkillsInfoService);

  private readonly projectStepService = inject(ProjectStepService);
  private readonly assignProjectProgramUseCase = inject(AssignProjectProgramUseCase);
  private readonly deleteProjectUseCase = inject(DeleteProjectUseCase);
  private readonly updateFormUseCase = inject(UpdateFormUseCase);

  private readonly projectTeamUIService = inject(ProjectTeamUIService);
  private readonly projectVacancyUIService = inject(ProjectVacancyUIService);
  private readonly projectsEditUIInfoService = inject(ProjectsEditUIInfoService);

  private readonly industryRepository = inject(IndustryRepositoryPort);
  private readonly skillsService = inject(SkillsService);
  private readonly navService = inject(NavService);
  private readonly validationService = inject(ValidationService);
  private readonly snackBarService = inject(SnackbarService);
  private readonly logger = inject(LoggerService);

  private readonly projectFormService = inject(ProjectFormService);

  private readonly projectVacancyService = inject(ProjectVacancyService);
  private readonly projectGoalsService = inject(ProjectGoalService);

  private readonly projectPartnerService = inject(ProjectPartnerService);
  private readonly projectResourceService = inject(ProjectResourceService);

  private readonly projectAchievementsService = inject(ProjectAchievementsService);
  private readonly projectAdditionalService = inject(ProjectAdditionalService);

  private readonly projectContactsService = inject(ProjectContactsService);

  private readonly destroy$ = new Subject<void>();

  // Текущий шаг редактирования
  readonly editingStep = this.projectStepService.currentStep;

  // Получаем сигналы из сервиса
  readonly achievements = this.projectFormService.achievements;

  // Id связи проекта и программы
  readonly relationId = computed(() => this.projectFormService.relationId);
  private readonly leaderId = this.projectsEditUIInfoService.leaderId;

  private readonly isCompetitive = this.projectsEditUIInfoService.isCompetitive;
  private readonly isProjectAssignToProgram =
    this.projectsEditUIInfoService.isProjectAssignToProgram;

  private readonly fromProgram = this.projectsEditUIInfoService.fromProgram;
  private readonly fromProgramOpen = this.projectsEditUIInfoService.fromProgramOpen;

  // Получаем форму проекта из сервиса
  readonly projectForm = this.projectFormService.getForm();

  // Получаем форму дополнительных полей из сервиса
  readonly additionalForm = this.projectAdditionalService.getAdditionalForm();

  // Геттеры для работы с целями
  readonly goals = computed(() => this.projectGoalsService.goals);

  readonly partners = computed(() => this.projectPartnerService.partners);

  readonly resources = computed(() => this.projectResourceService.resources);

  // Observables для данных
  readonly industries$ = toObservable(this.industryRepository.industries).pipe(
    map(industries =>
      industries.map(industry => ({ value: industry.id, id: industry.id, label: industry.name }))
    ),
    takeUntil(this.destroy$)
  );

  readonly profileId = signal<number>(+this.route.snapshot.params["projectId"]);

  // Сигналы для управления состоянием
  readonly inlineSkills = this.skillsInfoService.inlineSkills;
  readonly nestedSkills$ = this.skillsService.getSkillsNested();

  // Состояние отправки форм
  readonly submitMode = signal<"draft" | "published" | null>(null);

  readonly projSubmitInitiated = signal<boolean>(false);
  readonly projFormIsSubmitting$ = signal<AsyncState<void>>(initial());

  readonly projFormIsSubmittingAsDraft = computed(
    () => this.submitMode() === "draft" && isLoading(this.projFormIsSubmitting$())
  );
  readonly projFormIsSubmittingAsPublished = computed(
    () => this.submitMode() === "published" && isLoading(this.projFormIsSubmitting$())
  );

  readonly openGroupIds = signal<Set<number>>(new Set());

  /**
   * Проверяет, есть ли открытые группы навыков
   */
  readonly hasOpenSkillsGroups = computed(() => this.openGroupIds().size > 0);

  initializationEditInfo(): void {
    this.navService.setNavTitle("Создание проекта");

    // Получение текущего шага редактирования из query параметров
    this.setupEditingStep();

    // Получение Id лидера проекта
    this.setupLeaderIdSubscription();
  }

  initializationLoadingProjectData(): void {
    this.loadProgramTagsAndProject();
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Методы для управления состоянием ошибок через сервис
  setAssignProjectToProgramError(error: { non_field_errors: string[] }): void {
    this.projectAdditionalService.setAssignProjectToProgramError(error);
  }

  /**
   * Привязка проекта к программе выбранной
   * Перенаправление её на редактирование "нового" проекта
   */
  assignProjectToProgram(): void {
    this.assignProjectProgramUseCase
      .execute(
        Number(this.route.snapshot.paramMap.get("projectId")),
        this.projectForm.get("partnerProgramId")?.value
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => {
          if (!r.ok) {
            if (r.error.cause instanceof HttpErrorResponse) {
              if (r.error.cause.status === 400) {
                this.setAssignProjectToProgramError(r.error.cause.error);
              }
            }
            return;
          }

          this.projectsEditUIInfoService.applyOpenAssignProjectModal(r.value);
          this.router.navigateByUrl(
            `/office/projects/${r.value.newProjectId}/edit?editingStep=main`
          );
        },
      });
  }

  onGroupToggled(isOpen: boolean, skillsGroupId: number): void {
    this.openGroupIds.update(set => {
      const next = new Set(set);
      next.clear();
      if (isOpen) next.add(skillsGroupId);
      return next;
    });
  }

  /**
   * Удаление проекта с проверкой удаления у пользователя
   */
  deleteProject(): void {
    const programId = this.projectForm.get("partnerProgramId")?.value;

    this.deleteProjectUseCase
      .execute(Number(this.route.snapshot.paramMap.get("projectId")))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          if (!result.ok) {
            return;
          }

          if (this.fromProgram()) {
            this.router.navigateByUrl(`/office/program/${programId}`);
          } else {
            this.router.navigateByUrl(`/office/projects/my`);
          }
        },
      });
  }

  /**
   * Сохранение проекта как опубликованного с проверкой доп. полей
   */
  saveProjectAsPublished(): void {
    this.projectForm.get("draft")?.patchValue(false);
    this.submitMode.set("published");

    if (!this.isCompetitive()) {
      this.projFormIsSubmitting$.set(loading());
      this.submitProjectForm();
      return;
    }

    this.projectForm.markAllAsTouched();
    this.projectFormService.achievements.markAllAsTouched();

    const projectValid = this.validationService.getFormValidation(this.projectForm);
    const additionalValid = this.validationService.getFormValidation(this.additionalForm);

    if (!projectValid || !additionalValid) {
      this.projSubmitInitiated.set(true);
      return;
    }

    if (this.validateAdditionalFields()) {
      this.projSubmitInitiated.set(true);
      return;
    }

    this.projectsEditUIInfoService.applySendDescision();
  }

  /**
   * Сохранение проекта как черновика
   */
  saveProjectAsDraft(): void {
    this.clearAllValidationErrors();
    this.projectForm.get("draft")?.patchValue(true);
    this.submitMode.set("draft");
    const partnerProgramId = this.projectForm.get("partnerProgramId")?.value;
    this.projectForm.patchValue({ partnerProgramId });
    this.projFormIsSubmitting$.set(loading());

    if (this.isCompetitive()) {
      const projectId = Number(this.route.snapshot.params["projectId"]);
      const relationId = this.relationId();
      this.sendAdditionalFields(projectId, relationId());
    } else {
      this.submitProjectForm();
    }
  }

  /**
   * Отправка формы проекта
   */
  submitProjectForm(): void {
    const isDraft = this.projectForm.get("draft")?.value === true;

    this.projectFormService.achievements.controls.forEach(achievementForm => {
      achievementForm.markAllAsTouched();
    });

    const payload = this.projectFormService.getFormValue();
    const projectId = Number(this.route.snapshot.paramMap.get("projectId"));

    if (this.projectVacancyUIService.isDirty()) {
      this.projectVacancyService.submitVacancy(projectId);
    }

    if (isDraft) {
      if (
        !this.validationService.getFormValidation(this.projectForm) ||
        this.projectVacancyUIService.applyValidateForm()
      ) {
        return;
      }
    } else {
      if (
        !this.validationService.getFormValidation(this.projectForm) ||
        !this.validationService.getFormValidation(this.additionalForm) ||
        this.projectVacancyUIService.applyValidateForm()
      ) {
        return;
      }
    }

    this.submitMode.set(null);
    this.updateFormUseCase
      .execute({ id: projectId, data: payload })
      .pipe(
        switchMap(result => {
          if (!result.ok) {
            this.handleProjectSubmitError(result.error.cause);
            return EMPTY;
          }

          return this.saveOrEditGoals(projectId);
        }),
        switchMap(() => this.savePartners(projectId)),
        switchMap(() => this.saveOrEditResources(projectId))
      )
      .subscribe({
        next: () => {
          this.completeSubmitedProjectForm(projectId);
        },
        error: err => {
          this.submitMode.set(null);
          this.projFormIsSubmitting$.set(failure("ошибка при сохранении данных"));
          this.snackBarService.error("ошибка при сохранении данных");
          if (err.error["error"].includes("Срок подачи проектов в программу завершён.")) {
            this.projectsEditUIInfoService.applyOpenSendDescisionLateModal();
          }
        },
      });
  }

  closeSendingDescisionModal(): void {
    this.projectsEditUIInfoService.applyCloseSendDescisionModal();

    const projectId = Number(this.route.snapshot.params["projectId"]);
    const relationId = this.relationId();

    this.projFormIsSubmitting$.set(loading());
    this.sendAdditionalFields(projectId, relationId());
  }

  loadProgramTagsAndProject(): void {
    // Сброс состояния перед загрузкой
    this.isCompetitive.set(false);
    this.isProjectAssignToProgram.set(false);

    this.route.data
      .pipe(
        map(d => d["data"]),
        takeUntil(this.destroy$)
      )
      .subscribe(
        ([project, goals, partners, resources, invites]: [
          Project,
          Goal[],
          Partner[],
          Resource[],
          Invite[]
        ]) => {
          // Используем сервис для инициализации данных проекта
          this.projectFormService.initializeProjectData(project);
          this.projectAchievementsService.syncAchievementsItems(
            this.projectFormService.achievements
          );
          this.projectGoalsService.initializeGoalsFromProject(goals);
          this.projectPartnerService.initializePartnerFromProject(partners);
          this.projectResourceService.initializeResourcesFromProject(resources);
          this.projectTeamUIService.applySetInvites(invites);
          this.projectTeamUIService.applySetCollaborators(project.collaborators);

          // Синхронизируем ссылки после инициализации данных проекта
          this.projectContactsService.syncLinksItems(this.projectFormService.links);

          if (project.partnerProgram) {
            this.isCompetitive.set(
              !!project.partnerProgram.programId && project.partnerProgram.canSubmit
            );
            this.isProjectAssignToProgram.set(!!project.partnerProgram.programId);

            this.projectAdditionalService.initializeAdditionalForm(
              project.partnerProgram?.programFields,
              project.partnerProgram?.programFieldValues
            );
          }

          this.projectVacancyUIService.applySetVacancies(project.vacancies);
        }
      );
  }

  /**
   * Поиск навыков
   * @param query - поисковый запрос
   */
  onSearchSkill(query: string): void {
    this.skillsInfoService.onSearchSkill(query);
  }

  private setupEditingStep(): void {
    const stepFromUrl = this.route.snapshot.queryParams["editingStep"] as EditStep;
    if (stepFromUrl) {
      this.projectStepService.setStepFromRoute(stepFromUrl);
    }

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const step = params["editingStep"] as EditStep;
      this.fromProgram.set(params["fromProgram"]);

      const seen = this.projectsEditUIInfoService.hasSeenFromProgramModal();
      if (this.fromProgram() && !seen) {
        this.fromProgramOpen.set(true);
        this.projectsEditUIInfoService.markSeenFromProgramModal();
      } else {
        this.fromProgramOpen.set(false);
      }

      if (step && step !== this.editingStep()) {
        this.projectStepService.setStepFromRoute(step);
      }
    });
  }

  private setupLeaderIdSubscription(): void {
    this.route.data
      .pipe(
        distinctUntilChanged(),
        map(d => d["data"]),
        takeUntil(this.destroy$)
      )
      .subscribe(([project]: [Project]) => {
        this.leaderId.set(project.leader);
      });
  }

  /**
   * Валидация дополнительных полей для публикации
   * Делегирует валидацию сервису
   * @returns true если есть ошибки валидации
   */
  private validateAdditionalFields(): boolean {
    const partnerProgramFields = this.projectAdditionalService.partnerProgramFields();

    // Если нет дополнительных полей - пропускаем валидацию
    if (!partnerProgramFields?.length) {
      return false;
    }

    // Проверяем только обязательные поля
    const hasInvalid = this.projectAdditionalService.validateRequiredFields();

    if (hasInvalid) {
      return true;
    }

    // Подготавливаем поля для отправки (убираем валидаторы с заполненных полей)
    this.projectAdditionalService.prepareFieldsForSubmit();
    return false;
  }

  /**
   * Очистка всех ошибок валидации
   */
  private clearAllValidationErrors(): void {
    // Очистка основной формы
    this.projectFormService.clearAllValidationErrors();
    this.projectAchievementsService.clearAllAchievementsErrors(this.achievements);

    // Очистка ошибок целей теперь входит в clearAllValidationErrors() ProjectFormService
  }

  private saveOrEditGoals(projectId: number) {
    const goals = this.goals().value as Goal[];

    const newGoals = goals.filter(g => !g.id);
    const existingGoals = goals.filter(g => g.id);

    const requests: Observable<any>[] = [];

    if (newGoals.length > 0) {
      requests.push(this.projectGoalsService.saveGoals(projectId, newGoals));
    }

    if (existingGoals.length > 0) {
      requests.push(this.projectGoalsService.editGoals(projectId, existingGoals));
    }

    if (requests.length === 0) {
      return of(null);
    }

    return forkJoin(requests).pipe(
      tap(() => {
        this.projectGoalsService.syncGoalItems(this.projectGoalsService.goals);
      })
    );
  }

  private savePartners(projectId: number) {
    const partners = this.partners().value;

    if (!partners.length) {
      return of([]);
    }

    return this.projectPartnerService.savePartners(projectId);
  }

  private saveOrEditResources(projectId: number) {
    const resources = this.resources().value;
    const hasExistingResources = resources.some((r: Resource) => r.id != null);

    if (!resources.length) {
      return of([]);
    }

    return hasExistingResources
      ? this.projectResourceService.editResources(projectId)
      : this.projectResourceService.saveResources(projectId);
  }

  private completeSubmitedProjectForm(projectId: number) {
    this.snackBarService.success("данные успешно сохранены");
    this.submitMode.set(null);
    this.projFormIsSubmitting$.set(success(undefined));
    this.router.navigateByUrl(`/office/projects/${projectId}`);
  }

  private handleProjectSubmitError(error?: unknown): void {
    this.submitMode.set(null);
    this.projFormIsSubmitting$.set(failure("ошибка при сохранении данных"));
    this.snackBarService.error("ошибка при сохранении данных");

    if (
      error instanceof HttpErrorResponse &&
      Array.isArray(error.error?.error) &&
      error.error.error.includes("Срок подачи проектов в программу завершён.")
    ) {
      this.projectsEditUIInfoService.applyOpenSendDescisionLateModal();
    }
  }

  /**
   * Отправка дополнительных полей через сервис
   * @param projectId - ID проекта
   * @param relationId - ID связи проекта и конкурсной программы
   */
  private sendAdditionalFields(projectId: number, relationId: number): void {
    const isDraft = this.projectForm.get("draft")?.value === true;

    this.projectAdditionalService
      .sendAdditionalFieldsValues(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.logger.error("Error sending additional fields:", result.error.cause);
            this.projectAdditionalService.resetSendingState();
            this.submitMode.set("draft");
            return;
          }

          if (!isDraft) {
            this.projectAdditionalService
              .submitCompettetiveProject(relationId)
              .pipe(takeUntil(this.destroy$))
              .subscribe(submitResult => {
                if (!submitResult.ok) {
                  this.logger.error(
                    "Error submitting competitive project:",
                    submitResult.error.cause
                  );
                  this.projectAdditionalService.resetSendingState();
                  this.submitMode.set("draft");
                  return;
                }

                this.projectAdditionalService.resetSendingState();
                this.submitProjectForm();
              });
          } else {
            this.projectAdditionalService.resetSendingState();
            this.submitProjectForm();
          }
        },
        error: error => {
          this.logger.error("Error sending additional fields:", error);
          this.projectAdditionalService.resetSendingState();
          this.submitMode.set("draft");
        },
      });
  }
}
