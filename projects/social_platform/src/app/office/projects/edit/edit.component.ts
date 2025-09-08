/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ErrorMessage } from "@error/models/error-message";
import { Invite } from "@models/invite.model";
import { Project } from "@models/project.model";
import { Skill } from "@office/models/skill";
import { ProgramTag } from "@office/program/models/program.model";
import { ProgramService } from "@office/program/services/program.service";
import { SkillsService } from "@office/services/skills.service";
import { SkillsGroupComponent } from "@office/shared/skills-group/skills-group.component";
import { IndustryService } from "@services/industry.service";
import { NavService } from "@services/nav.service";
import { ProjectService } from "@services/project.service";
import { ButtonComponent, IconComponent, SelectComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ValidationService } from "projects/core";
import {
  Observable,
  Subscription,
  concatMap,
  distinctUntilChanged,
  finalize,
  map,
  tap,
} from "rxjs";
import { CommonModule, AsyncPipe } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { ProjectAssign } from "../models/project-assign.model";
import { ProjectNavigationComponent } from "./shared/project-navigation/project-navigation.component";
import { EditStep, ProjectStepService } from "./services/project-step.service";
import { ProjectMainStepComponent } from "./shared/project-main-step/project-main-step.component";
import { ProjectFormService } from "./services/project-form.service";
import { ProjectContactsStepComponent } from "./shared/project-contacts-step/project-contacts-step.component";
import { ProjectAchievementStepComponent } from "./shared/project-achievement-step/project-achievement-step.component";
import { ProjectVacancyStepComponent } from "./shared/project-vacancy-step/project-vacancy-step.component";
import { ProjectVacancyService } from "./services/project-vacancy.service";
import { ProjectTeamStepComponent } from "./shared/project-team-step/project-team-step.component";
import { ProjectTeamService } from "./services/project-team.service";
import { ProjectAdditionalStepComponent } from "./shared/project-additional-step/project-additional-step.component";
import { ProjectAdditionalService } from "./services/project-additional.service";
import { ProjectAchievementsService } from "./services/project-achievements.service";
import { Goal } from "@office/models/goals.model";
import { ProjectGoalService } from "./services/project-goals.service";
import { SnackbarService } from "@ui/services/snackbar.service";

/**
 * Компонент редактирования проекта
 *
 * Функциональность:
 * - Многошаговое редактирование проекта (основная информация, контакты, достижения, вакансии, команда)
 * - Управление формами для проекта, вакансий и приглашений
 * - Загрузка файлов (презентация, обложка, аватар)
 * - Создание и редактирование вакансий с навыками
 * - Приглашение участников в команду
 * - Управление достижениями и ссылками проекта
 * - Сохранение как черновик или публикация
 *
 * Принимает:
 * - ID проекта из URL параметров
 * - Данные проекта и приглашений через resolver
 * - Query параметр editingStep для определения активного шага
 *
 * Возвращает:
 * - Интерфейс редактирования с навигацией по шагам
 * - Формы для ввода данных проекта
 * - Модальные окна для управления навыками и приглашениями
 *
 * Особенности:
 * - Реактивные формы с валидацией
 * - Динамическое управление массивами (достижения, ссылки)
 * - Интеграция с внешними сервисами (навыки, программы)
 * - Поддержка автокомплита для навыков
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
    ProjectContactsStepComponent,
    ProjectAchievementStepComponent,
    ProjectVacancyStepComponent,
    ProjectTeamStepComponent,
    ProjectAdditionalStepComponent,
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
    private readonly programService: ProgramService,
    private readonly projectStepService: ProjectStepService,
    private readonly projectFormService: ProjectFormService,
    private readonly projectVacancyService: ProjectVacancyService,
    private readonly projectTeamService: ProjectTeamService,
    private readonly projectAchievementsService: ProjectAchievementsService,
    private readonly snackBarService: SnackbarService,
    private readonly skillsService: SkillsService,
    private readonly projectAdditionalService: ProjectAdditionalService
  ) {}

  // Получаем форму проекта из сервиса
  get projectForm(): FormGroup {
    return this.projectFormService.getForm();
  }

  // Получаем форму вакансии из сервиса
  get vacancyForm(): FormGroup {
    return this.projectVacancyService.getVacancyForm();
  }

  // Получаем форму вакансии из сервиса
  get additionalForm(): FormGroup {
    return this.projectAdditionalService.getAdditionalForm();
  }

  // Получаем сигналы из сервиса
  get achievements() {
    return this.projectFormService.achievements;
  }

  // Id редатируемой части проекта
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

  get errorAssignProjectToProgramModalMessage() {
    return this.projectAdditionalService.getErrorAssignProjectToProgramModalMessage();
  }

  // Методы для управления состоянием ошибок через сервис
  setAssignProjectToProgramError(error: { non_field_errors: string[] }): void {
    this.projectAdditionalService.setAssignProjectToProgramError(error);
  }

  clearAssignProjectToProgramError(): void {
    this.projectAdditionalService.clearAssignProjectToProgramError();
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
  }

  // Опции для программных тегов
  programTagsOptions: SelectComponent["options"] = [];
  programTags: ProgramTag[] = [];

  // Id Лидера проекта
  leaderId = 0;

  // Маркер того является ли проект привязанный к конкурсной программе
  isCompetitive = false;

  // Маркер что проект привязан
  isProjectBoundToProgram = false;

  // Текущий шаг редактирования
  get editingStep(): EditStep {
    return this.projectStepService.getCurrentStep()();
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

  // Сигналы для работы с модальными окнами с текстом
  assignProjectToProgramModalMessage = signal<ProjectAssign | null>(null);

  // Observables для данных
  industries$ = this.industryService.industries.pipe(
    map(industries =>
      industries.map(industry => ({ value: industry.id, id: industry.id, label: industry.name }))
    )
  );

  subscriptions: (Subscription | undefined)[] = [];

  profileId: number = this.route.snapshot.params["projectId"];

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

  onGroupToggled(isOpen: boolean, groupId: number) {
    if (isOpen) {
      this.openGroupIds.add(groupId);
    } else {
      this.openGroupIds.delete(groupId);
    }
  }

  /**
   * Привязка проекта к программе выбранной
   * Перенаправление её на редактирование "нового" проекта
   */
  assignProjectToProgram(): void {
    this.projectService
      .assignProjectToProgram(
        Number(this.route.snapshot.paramMap.get("projectId")),
        this.projectForm.get("partnerProgramId")?.value
      )
      .subscribe({
        next: r => {
          this.assignProjectToProgramModalMessage.set(r);
          this.isAssignProjectToProgramModalOpen.set(true);
        },

        error: err => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 400) {
              this.setAssignProjectToProgramError(err.error);
            }
          }
        },
      });
  }

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
  }

  /**
   * Удаление проекта с проверкой удаления у пользователя
   */
  deleteProject(): void {
    if (!confirm("Вы точно хотите удалить проект?")) {
      return;
    }

    this.projectService.remove(Number(this.route.snapshot.paramMap.get("projectId"))).subscribe({
      next: () => {
        this.router.navigateByUrl(`/office/projects/my`);
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
    this.submitProjectForm();
  }

  /**
   * Отправка формы проекта
   */
  submitProjectForm(): void {
    this.projectFormService.achievements.controls.forEach(achievementForm => {
      achievementForm.markAllAsTouched();
    });

    const payload = this.projectFormService.getFormValue();
    const projectId = Number(this.route.snapshot.paramMap.get("projectId"));

    if (this.vacancyForm.dirty) {
      this.projectVacancyService.submitVacancy(projectId);
    }

    console.log(payload.goals);

    if (
      !this.validationService.getFormValidation(this.projectForm) ||
      !this.validationService.getFormValidation(this.additionalForm) ||
      !this.validationService.getFormValidation(this.vacancyForm)
    ) {
      return;
    }

    this.setProjFormIsSubmitting(true);
    // this.projectService.updateProject(projectId, payload).subscribe({
    //   next: () => {
    //     this.snackBarService.success("Данные успешно сохранены");
    //     this.setProjFormIsSubmitting(false);
    //     this.router.navigateByUrl(`/office/projects/my`);
    //   },
    //   error: () => {
    //     this.setProjFormIsSubmitting(false);
    //     this.snackBarService.error("Что-то пошло не так!");
    //   },
    // });
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
    this.router.navigateByUrl(`/office/projects/my`);
  }

  /**
   * Валидация дополнительных полей для публикации
   * Делегирует валидацию сервису
   * @returns true если есть ошибки валидации
   */
  private validateAdditionalFields(): boolean {
    const partnerProgramFields = this.projectAdditionalService.getPartnerProgramFields();

    if (!partnerProgramFields?.length) {
      return false;
    }

    const hasInvalid = this.projectAdditionalService.validateRequiredFields();

    if (hasInvalid) {
      this.cdRef.markForCheck();
      return true;
    }

    // Подготавливаем поля для отправки
    this.projectAdditionalService.prepareFieldsForSubmit();
    return false;
  }

  /**
   * Отправка дополнительных полей через сервис
   * @param projectId - ID проекта
   * @param relationId - ID связи проекта и конкурсной программы
   */
  private sendAdditionalFields(projectId: number, relationId: number): void {
    this.projectAdditionalService.sendAdditionalFieldsValues(projectId).subscribe({
      next: () => {
        this.projectAdditionalService.submitCompettetiveProject(relationId).subscribe(_ => {
          this.submitProjectForm();
        });
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
    this.programService
      .programTags()
      .pipe(
        tap(tags => {
          this.programTags = tags;
        }),
        map(tags => [
          { label: "Без тега", value: 0, id: 0 },
          ...tags.map(t => ({ label: t.name, value: t.id, id: t.id })),
        ]),
        tap(tags => {
          this.programTagsOptions = tags;
        }),
        concatMap(() => this.route.data),
        map(d => d["data"])
      )
      .subscribe(([project, goals, invites]: [Project, Goal[], Invite[]]) => {
        // Используем сервис для инициализации данных проекта
        this.projectFormService.initializeProjectData(project, goals);
        this.projectTeamService.setInvites(invites);
        this.projectTeamService.setCollaborators(project.collaborators);

        // Инициализируем дополнительные поля через сервис
        if (project.partnerProgram) {
          this.isCompetitive = project.partnerProgram.canSubmit;
          this.isProjectBoundToProgram = !!project.partnerProgram.programId;

          this.projectAdditionalService.initializeAdditionalForm(
            project.partnerProgram?.programFields,
            project.partnerProgram?.programFieldValues
          );
        }

        this.projectVacancyService.setVacancies(project.vacancies);
        this.projectTeamService.setInvites(invites);

        this.cdRef.detectChanges();
      });
  }
}
