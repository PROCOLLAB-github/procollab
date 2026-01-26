/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { Form, FormArray, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { SkillsGroupComponent } from "@ui/shared/skills-group/skills-group.component";
import { IndustryService } from "projects/social_platform/src/app/api/industry/industry.service";
import { NavService } from "@ui/services/nav/nav.service";
import { ProjectService } from "projects/social_platform/src/app/api/project/project.service";
import { ButtonComponent, IconComponent, SelectComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ValidationService } from "projects/core";
import {
  Observable,
  Subscription,
  distinctUntilChanged,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
} from "rxjs";
import { CommonModule, AsyncPipe } from "@angular/common";
import { ProjectNavigationComponent } from "./components/project-navigation/project-navigation.component";
import { EditStep, ProjectStepService } from "../../../../api/project/project-step.service";
import { ProjectMainStepComponent } from "./components/project-main-step/project-main-step.component";
import { ProjectFormService } from "../../../../api/project/project-form.service";
import { ProjectPartnerResourcesStepComponent } from "./components/project-partner-resources-step/project-partner-resources-step.component";
import { ProjectAchievementStepComponent } from "./components/project-achievement-step/project-achievement-step.component";
import { ProjectVacancyStepComponent } from "./components/project-vacancy-step/project-vacancy-step.component";
import { ProjectVacancyService } from "../../../../api/project/project-vacancy.service";
import { ProjectTeamStepComponent } from "./components/project-team-step/project-team-step.component";
import { ProjectTeamService } from "../../../../api/project/project-team.service";
import { ProjectAdditionalStepComponent } from "./components/project-additional-step/project-additional-step.component";
import { ProjectAdditionalService } from "../../../../api/project/project-additional.service";
import { ProjectAchievementsService } from "../../../../api/project/project-achievements.service";
import { ProjectGoalService } from "../../../../api/project/project-goals.service";
import { SnackbarService } from "@ui/services/snackbar/snackbar.service";
import { ProjectPartnerService } from "../../../../api/project/project-partner.service";
import { ProjectResourceService } from "../../../../api/project/project-resources.service";
import { HttpErrorResponse } from "@angular/common/http";
import { SkillsService } from "projects/social_platform/src/app/api/skills/skills.service";
import { ProjectAssign } from "projects/social_platform/src/app/domain/project/project-assign.model";
import { Skill } from "projects/social_platform/src/app/domain/skills/skill";
import { Goal } from "projects/social_platform/src/app/domain/project/goals.model";
import { Resource } from "projects/social_platform/src/app/domain/project/resource.model";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";
import { Partner } from "projects/social_platform/src/app/domain/project/partner.model";
import { ProgramService } from "projects/social_platform/src/app/api/program/program.service";
import { navProjectItems } from "projects/core/src/consts/navigation/nav-project-items.const";

/**
 * Компонент редактирования проекта
 *
 * Функциональность:
 * - Многошаговое редактирование проекта (основная информация, контакты, достижения, вакансии, команда)
 * - Управление формами для проекта, вакансий и приглашений
 * - Загрузка файлов (презентация, обложка, аватар)
 * - Создание и редактирование вакансий с навыками
 * - Приглашение участников в команду
 * - Управление достижениями, ссылками и целями проекта
 * - Сохранение как черновик или публикация
 */
@Component({
  selector: "app-edit",
  templateUrl: "./edit.component.html",
  styleUrl: "./edit.component.scss",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    IconComponent,
    ButtonComponent,
    ModalComponent,
    AsyncPipe,
    SkillsGroupComponent,
    ProjectNavigationComponent,
    ProjectMainStepComponent,
    ProjectAchievementStepComponent,
    ProjectVacancyStepComponent,
    ProjectTeamStepComponent,
    ProjectAdditionalStepComponent,
    ProjectPartnerResourcesStepComponent,
  ],
  providers: [
    ProjectFormService,
    ProjectVacancyService,
    ProjectAdditionalService,
    ProjectGoalService,
    ProjectPartnerService,
    ProjectResourceService,
  ],
})
export class ProjectEditComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly industryService: IndustryService,
    protected readonly projectService: ProjectService,
    private readonly navService: NavService,
    private readonly validationService: ValidationService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly projectStepService: ProjectStepService,
    private readonly projectFormService: ProjectFormService,
    private readonly projectVacancyService: ProjectVacancyService,
    private readonly projectTeamService: ProjectTeamService,
    private readonly projectAchievementsService: ProjectAchievementsService,
    private readonly projectGoalsService: ProjectGoalService,
    private readonly projectPartnerService: ProjectPartnerService,
    private readonly projectResourceService: ProjectResourceService,
    private readonly snackBarService: SnackbarService,
    private readonly skillsService: SkillsService,
    private readonly projectAdditionalService: ProjectAdditionalService,
    private readonly programService: ProgramService,
    private readonly projectGoalService: ProjectGoalService
  ) {}

  protected readonly navProjectItems = navProjectItems;

  // Получаем форму проекта из сервиса
  get projectForm(): FormGroup {
    return this.projectFormService.getForm();
  }

  // Получаем форму вакансии из сервиса
  get vacancyForm(): FormGroup {
    return this.projectVacancyService.getVacancyForm();
  }

  // Получаем форму дополнительных полей из сервиса
  get additionalForm(): FormGroup {
    return this.projectAdditionalService.getAdditionalForm();
  }

  // Получаем сигналы из сервиса
  get achievements() {
    return this.projectFormService.achievements;
  }

  // Id редактируемой части проекта
  get editIndex() {
    return this.projectFormService.editIndex;
  }

  // Id связи проекта и программы
  get relationId() {
    return this.projectFormService.relationId;
  }

  // Геттеры для доступа к данным из сервиса дополнительных полей
  get partnerProgramFields() {
    return this.projectAdditionalService.getPartnerProgramFields();
  }

  get isAssignProjectToProgramError() {
    return this.projectAdditionalService.getIsAssignProjectToProgramError()();
  }

  protected readonly errorAssignProjectToProgramModalMessage =
    this.projectAdditionalService.errorAssignProjectToProgramModalMessage;

  // Методы для управления состоянием ошибок через сервис
  setAssignProjectToProgramError(error: { non_field_errors: string[] }): void {
    this.projectAdditionalService.setAssignProjectToProgramError(error);
  }

  clearAssignProjectToProgramError(): void {
    this.projectAdditionalService.clearAssignProjectToProgramError();
  }

  // Геттеры для работы с целями
  get goals(): FormArray {
    return this.projectGoalsService.goals;
  }

  get partners(): FormArray {
    return this.projectPartnerService.partners;
  }

  get resources(): FormArray {
    return this.projectResourceService.resources;
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Создание проекта");

    // Получение текущего шага редактирования из query параметров
    this.setupEditingStep();

    // Получение Id лидера проекта
    this.setupLeaderIdSubscription();
  }

  ngAfterViewInit(): void {
    // Загрузка данных программных тегов и проекта
    this.loadProgramTagsAndProject();
  }

  ngOnDestroy(): void {
    this.profile$?.unsubscribe();
    this.subscriptions.forEach($ => $?.unsubscribe());

    // Сброс состояния ProjectGoalService при уничтожении компонента
    this.projectGoalService.reset();
  }

  // Опции для программных тегов
  programTagsOptions: SelectComponent["options"] = [];

  // Id Лидера проекта
  leaderId = 0;

  fromProgram = "";

  // Маркер того является ли проект привязанный к конкурсной программе
  isCompetitive = false;
  isProjectAssignToProgram = false;

  // Маркер что проект привязан
  isProjectBoundToProgram = false;

  // Текущий шаг редактирования
  get editingStep(): EditStep {
    return this.projectStepService.currentStep();
  }

  get hasOpenSkillsGroups(): boolean {
    return this.openGroupIds.size > 0;
  }

  // Состояние компонента
  isCompleted = false;
  isSendDescisionToPartnerProgramProject = false;

  profile$?: Subscription;
  errorMessage = ErrorMessage;

  // Сигналы для работы с модальными окнами с ошибкой
  errorModalMessage = signal<{
    program_name: string;
    whenCanEdit: string;
    daysUntilResolution: string;
  } | null>(null);

  onEditClicked = signal(false);
  warningModalSeen = false;

  // Observables для данных
  industries$ = this.industryService.industries.pipe(
    map(industries =>
      industries.map(industry => ({ value: industry.id, id: industry.id, label: industry.name }))
    )
  );

  subscriptions: (Subscription | undefined)[] = [];

  profileId: number = +this.route.snapshot.params["projectId"];

  // Сигналы для управления состоянием
  inlineSkills = signal<Skill[]>([]);
  nestedSkills$ = this.skillsService.getSkillsNested();
  skillsGroupsModalOpen = signal(false);
  isAssignProjectToProgramModalOpen = signal(false);

  // Состояние отправки форм
  projSubmitInitiated = false;
  projFormIsSubmittingAsPublished = false;
  projFormIsSubmittingAsDraft = false;
  openGroupIds = new Set<number>();

  /**
   * Навигация между шагами редактирования
   * @param step - название шага
   */
  navigateStep(step: EditStep): void {
    this.projectStepService.navigateToStep(step);
  }

  // /**
  //  * Привязка проекта к программе выбранной
  //  * Перенаправление её на редактирование "нового" проекта
  //  */
  // assignProjectToProgram(): void {
  //   this.projectService
  //     .assignProjectToProgram(
  //       Number(this.route.snapshot.paramMap.get("projectId")),
  //       this.projectForm.get("partnerProgramId")?.value
  //     )
  //     .subscribe({
  //       next: r => {
  //         this.assignProjectToProgramModalMessage.set(r);
  //         this.isAssignProjectToProgramModalOpen.set(true);
  //         this.router.navigateByUrl(`/office/projects/${r.newProjectId}/edit?editingStep=main`);
  //       },

  //       error: err => {
  //         if (err instanceof HttpErrorResponse) {
  //           if (err.status === 400) {
  //             this.setAssignProjectToProgramError(err.error);
  //           }
  //         }
  //       },
  //     });
  // }

  // Методы для управления состоянием отправки форм
  setIsSubmittingAsPublished(status: boolean): void {
    this.projFormIsSubmittingAsPublished = status;
  }

  setIsSubmittingAsDraft(status: boolean): void {
    this.projFormIsSubmittingAsDraft = status;
  }

  setProjFormIsSubmitting!: (status: boolean) => void;

  /**
   * Очистка всех ошибок валидации
   */
  clearAllValidationErrors(): void {
    // Очистка основной формы
    this.projectFormService.clearAllValidationErrors();
    this.projectAchievementsService.clearAllAchievementsErrors(this.achievements);

    // Очистка ошибок целей теперь входит в clearAllValidationErrors() ProjectFormService
  }

  onGroupToggled(isOpen: boolean, skillsGroupId: number): void {
    this.openGroupIds.clear();
    if (isOpen) {
      this.openGroupIds.add(skillsGroupId);
    }

    this.cdRef.markForCheck();
  }

  /**
   * Удаление проекта с проверкой удаления у пользователя
   */
  deleteProject(): void {
    if (!confirm("Вы точно хотите удалить проект?")) {
      return;
    }

    const programId = this.projectForm.get("partnerProgramId")?.value;

    this.projectService.remove(Number(this.route.snapshot.paramMap.get("projectId"))).subscribe({
      next: () => {
        if (this.fromProgram) {
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
    this.setProjFormIsSubmitting = this.setIsSubmittingAsPublished;

    if (!this.isCompetitive) {
      this.submitProjectForm();
      return;
    }

    this.projectForm.markAllAsTouched();
    this.projectFormService.achievements.markAllAsTouched();

    const projectValid = this.validationService.getFormValidation(this.projectForm);
    const additionalValid = this.validationService.getFormValidation(this.additionalForm);

    if (!projectValid || !additionalValid) {
      this.projSubmitInitiated = true;
      this.cdRef.markForCheck();
      return;
    }

    if (this.validateAdditionalFields()) {
      this.projSubmitInitiated = true;
      this.cdRef.markForCheck();
      return;
    }

    this.isSendDescisionToPartnerProgramProject = true;
    this.cdRef.markForCheck();
  }

  /**
   * Сохранение проекта как черновика
   */
  saveProjectAsDraft(): void {
    this.clearAllValidationErrors();
    this.projectForm.get("draft")?.patchValue(true);
    this.setProjFormIsSubmitting = this.setIsSubmittingAsDraft;
    const partnerProgramId = this.projectForm.get("partnerProgramId")?.value;
    this.projectForm.patchValue({ partnerProgramId });
    this.closeSendingDescisionModal();
    this.submitProjectForm();
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

    if (this.vacancyForm.dirty) {
      this.projectVacancyService.submitVacancy(projectId);
    }

    if (isDraft) {
      if (
        !this.validationService.getFormValidation(this.projectForm) ||
        !this.validationService.getFormValidation(this.vacancyForm)
      ) {
        return;
      }
    } else {
      if (
        !this.validationService.getFormValidation(this.projectForm) ||
        !this.validationService.getFormValidation(this.additionalForm) ||
        !this.validationService.getFormValidation(this.vacancyForm)
      ) {
        return;
      }
    }

    this.setProjFormIsSubmitting(true);
    this.projectService
      .updateProject(projectId, payload)
      .pipe(
        switchMap(() => this.saveOrEditGoals(projectId)),
        switchMap(() => this.savePartners(projectId)),
        switchMap(() => this.saveOrEditResources(projectId))
      )
      .subscribe({
        next: () => {
          this.completeSubmitedProjectForm(projectId);
        },
        error: () => {
          this.setProjFormIsSubmitting(false);
          this.snackBarService.error("ошибка при сохранении данных");
        },
      });
  }

  // Методы для работы с модальными окнами
  closeWarningModal(): void {
    this.warningModalSeen = true;
  }

  closeSendingDescisionModal(): void {
    this.isSendDescisionToPartnerProgramProject = false;

    const projectId = Number(this.route.snapshot.params["projectId"]);
    const relationId = this.relationId();

    this.sendAdditionalFields(projectId, relationId);
  }

  closeAssignProjectToProgramModal(): void {
    this.isAssignProjectToProgramModalOpen.set(false);
  }

  private saveOrEditGoals(projectId: number) {
    const goals = this.goals.value as Goal[];

    const newGoals = goals.filter(g => !g.id);
    const existingGoals = goals.filter(g => g.id);

    const requests: Observable<any>[] = [];

    if (newGoals.length > 0) {
      requests.push(this.projectGoalService.saveGoals(projectId, newGoals));
    }

    if (existingGoals.length > 0) {
      requests.push(this.projectGoalService.editGoals(projectId, existingGoals));
    }

    if (requests.length === 0) {
      return of(null);
    }

    return forkJoin(requests).pipe(
      tap(() => {
        this.projectGoalService.syncGoalItems(this.projectGoalService.goals);
      })
    );
  }

  private savePartners(projectId: number) {
    const partners = this.partners.value;

    if (!partners.length) {
      return of([]);
    }

    return this.projectPartnerService.savePartners(projectId);
  }

  private saveOrEditResources(projectId: number) {
    const resources = this.resources.value;
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
    this.setProjFormIsSubmitting(false);
    this.router.navigateByUrl(`/office/projects/${projectId}`);
  }

  /**
   * Валидация дополнительных полей для публикации
   * Делегирует валидацию сервису
   * @returns true если есть ошибки валидации
   */
  private validateAdditionalFields(): boolean {
    const partnerProgramFields = this.projectAdditionalService.getPartnerProgramFields();

    // Если нет дополнительных полей - пропускаем валидацию
    if (!partnerProgramFields?.length) {
      return false;
    }

    // Проверяем только обязательные поля
    const hasInvalid = this.projectAdditionalService.validateRequiredFields();

    if (hasInvalid) {
      this.cdRef.markForCheck();
      return true;
    }

    // Подготавливаем поля для отправки (убираем валидаторы с заполненных полей)
    this.projectAdditionalService.prepareFieldsForSubmit();
    return false;
  }

  /**
   * Отправка дополнительных полей через сервис
   * @param projectId - ID проекта
   * @param relationId - ID связи проекта и конкурсной программы
   */
  private sendAdditionalFields(projectId: number, relationId: number): void {
    const isDraft = this.projectForm.get("draft")?.value === true;
    this.projectAdditionalService.sendAdditionalFieldsValues(projectId).subscribe({
      next: () => {
        if (!isDraft) {
          this.projectAdditionalService.submitCompettetiveProject(relationId).subscribe(_ => {
            this.submitProjectForm();
          });
        }
      },
      error: error => {
        console.error("Error sending additional fields:", error);
        this.setProjFormIsSubmitting(false);
      },
    });
  }

  /**
   * Добавление навыка
   * @param newSkill - новый навык
   */
  onAddSkill(newSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.vacancyForm.value;
    const isPresent = skills.some(skill => skill.id === newSkill.id);

    if (isPresent) return;

    this.vacancyForm.patchValue({ skills: [newSkill, ...skills] });
  }

  /**
   * Удаление навыка
   * @param oddSkill - навык для удаления
   */
  onRemoveSkill(oddSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.vacancyForm.value;

    this.vacancyForm.patchValue({
      skills: skills.filter(skill => skill.id !== oddSkill.id),
    });
  }

  /**
   * Поиск навыков
   * @param query - поисковый запрос
   */
  onSearchSkill(query: string): void {
    this.skillsService.getSkillsInline(query, 1000, 0).subscribe(({ results }) => {
      this.inlineSkills.set(results);
    });
  }

  /**
   * Переключение навыка в списке выбранных
   * @param toggledSkill - навык для переключения
   */
  onToggleSkill(toggledSkill: Skill): void {
    const { skills }: { skills: Skill[] } = this.vacancyForm.value;
    const isPresent = skills.some(skill => skill.id === toggledSkill.id);

    if (isPresent) {
      this.onRemoveSkill(toggledSkill);
    } else {
      this.onAddSkill(toggledSkill);
    }
  }

  /**
   * Переключение модального окна групп навыков
   */
  toggleSkillsGroupsModal(): void {
    this.skillsGroupsModalOpen.update(open => !open);
  }

  private setupEditingStep(): void {
    const stepFromUrl = this.route.snapshot.queryParams["editingStep"] as EditStep;
    if (stepFromUrl) {
      this.projectStepService.setStepFromRoute(stepFromUrl);
    }

    const editingStepSub$ = this.route.queryParams.subscribe(params => {
      const step = params["editingStep"] as EditStep;
      this.fromProgram = params["fromProgram"];
      if (step && step !== this.editingStep) {
        this.projectStepService.setStepFromRoute(step);
      }
    });

    this.subscriptions.push(editingStepSub$);
  }

  private setupLeaderIdSubscription(): void {
    this.route.data
      .pipe(
        distinctUntilChanged(),
        map(d => d["data"])
      )
      .subscribe(([project]: [Project]) => {
        this.leaderId = project.leader;
      });
  }

  private loadProgramTagsAndProject(): void {
    this.route.data
      .pipe(map(d => d["data"]))
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
          this.projectGoalService.initializeGoalsFromProject(goals);
          this.projectPartnerService.initializePartnerFromProject(partners);
          this.projectResourceService.initializeResourcesFromProject(resources);
          this.projectTeamService.setInvites(invites);
          this.projectTeamService.setCollaborators(project.collaborators);

          if (project.partnerProgram) {
            this.isCompetitive = project.partnerProgram.canSubmit;
            this.isProjectAssignToProgram = !!project.partnerProgram.programId;

            this.projectAdditionalService.initializeAdditionalForm(
              project.partnerProgram?.programFields,
              project.partnerProgram?.programFieldValues
            );
          }

          this.projectVacancyService.setVacancies(project.vacancies);
          this.projectTeamService.setInvites(invites);

          this.cdRef.detectChanges();
        }
      );
  }
}
