/** @format */

import { AfterViewInit, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { ButtonComponent, IconComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { CommonModule } from "@angular/common";
import { ProjectNavigationComponent } from "./components/project-navigation/project-navigation.component";
import { EditStep, ProjectStepService } from "../../../../api/project/project-step.service";
import { ProjectMainStepComponent } from "./components/project-main-step/project-main-step.component";
import { ProjectFormService } from "../../../../api/project/project-form.service";
import { ProjectPartnerResourcesStepComponent } from "./components/project-partner-resources-step/project-partner-resources-step.component";
import { ProjectAchievementStepComponent } from "./components/project-achievement-step/project-achievement-step.component";
import { ProjectVacancyStepComponent } from "./components/project-vacancy-step/project-vacancy-step.component";
import { ProjectTeamStepComponent } from "./components/project-team-step/project-team-step.component";
import { ProjectAdditionalStepComponent } from "./components/project-additional-step/project-additional-step.component";
import { navProjectItems } from "projects/core/src/consts/navigation/nav-project-items.const";
import { ProjectsEditInfoService } from "projects/social_platform/src/app/api/project/facades/edit/projects-edit-info.service";
import { ProjectsEditUIInfoService } from "projects/social_platform/src/app/api/project/facades/edit/ui/projects-edit-ui-info.service";
import { ProjectVacancyUIService } from "projects/social_platform/src/app/api/project/facades/edit/ui/project-vacancy-ui.service";
import { ProjectAdditionalService } from "projects/social_platform/src/app/api/project/facades/edit/project-additional.service";
import { ProjectGoalService } from "projects/social_platform/src/app/api/project/facades/edit/project-goals.service";
import { ProjectPartnerService } from "projects/social_platform/src/app/api/project/facades/edit/project-partner.service";
import { ProjectResourceService } from "projects/social_platform/src/app/api/project/facades/edit/project-resources.service";
import { ProjectVacancyService } from "projects/social_platform/src/app/api/project/facades/edit/project-vacancy.service";
import { ProjectTeamUIService } from "projects/social_platform/src/app/api/project/facades/edit/ui/project-team-ui.service";
import { ProjectTeamService } from "projects/social_platform/src/app/api/project/facades/edit/project-team.service";
import { TooltipInfoService } from "projects/social_platform/src/app/api/tooltip/tooltip-info.service";

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
    ProjectVacancyUIService,
    ProjectTeamService,
    ProjectTeamUIService,
    ProjectAdditionalService,
    ProjectGoalService,
    ProjectPartnerService,
    ProjectResourceService,
    ProjectsEditInfoService,
    ProjectsEditUIInfoService,
    TooltipInfoService,
  ],
})
export class ProjectEditComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly projectsEditInfoService = inject(ProjectsEditInfoService);
  private readonly projectsEditUIInfoService = inject(ProjectsEditUIInfoService);

  private readonly projectStepService = inject(ProjectStepService);
  private readonly projectVacancyUIService = inject(ProjectVacancyUIService);
  private readonly projectGoalService = inject(ProjectGoalService);

  // Получаем форму проекта из сервиса
  protected readonly projectForm = this.projectsEditInfoService.projectForm;

  // Получаем форму вакансии из сервиса
  protected readonly vacancyForm = this.projectVacancyUIService.vacancyForm;

  // Получаем форму дополнительных полей из сервиса
  protected readonly additionalForm = this.projectsEditInfoService.additionalForm;

  protected readonly fromProgram = this.projectsEditUIInfoService.fromProgram;

  // Маркер того является ли проект привязанный к конкурсной программе
  protected readonly isCompetitive = this.projectsEditUIInfoService.isCompetitive;
  protected readonly isProjectAssignToProgram =
    this.projectsEditUIInfoService.isProjectAssignToProgram;

  // Маркер что проект привязан
  protected readonly isProjectBoundToProgram =
    this.projectsEditUIInfoService.isProjectBoundToProgram;

  // Текущий шаг редактирования
  protected readonly editingStep = this.projectStepService.currentStep;

  // Состояние компонента
  protected readonly isCompleted = this.projectsEditUIInfoService.isCompleted;
  protected readonly isSendDescisionToPartnerProgramProject =
    this.projectsEditUIInfoService.isSendDescisionToPartnerProgramProject;

  // Сигналы для работы с модальными окнами с ошибкой
  protected readonly errorModalMessage = this.projectsEditUIInfoService.errorModalMessage;

  protected readonly onEditClicked = this.projectsEditUIInfoService.onEditClicked;
  protected readonly warningModalSeen = this.projectsEditUIInfoService.warningModalSeen;

  protected readonly profileId = this.projectsEditInfoService.profileId;

  // Состояние отправки форм
  protected readonly projSubmitInitiated = this.projectsEditInfoService.projSubmitInitiated;
  protected readonly projFormIsSubmittingAsPublished =
    this.projectsEditInfoService.projFormIsSubmittingAsPublished;

  protected readonly projFormIsSubmittingAsDraft =
    this.projectsEditInfoService.projFormIsSubmittingAsDraft;

  protected readonly navProjectItems = navProjectItems;
  protected readonly errorMessage = ErrorMessage;

  ngOnInit(): void {
    this.projectsEditInfoService.initializationEditInfo();
  }

  ngAfterViewInit(): void {
    // Загрузка данных программных тегов и проекта
    this.projectsEditInfoService.loadProgramTagsAndProject();
  }

  ngOnDestroy(): void {
    this.projectsEditInfoService.destroy();

    // Сброс состояния ProjectGoalService при уничтожении компонента
    this.projectGoalService.reset();
  }

  /**
   * Навигация между шагами редактирования
   * @param step - название шага
   */
  navigateStep(step: EditStep): void {
    this.projectStepService.navigateToStep(step);
  }

  /**
   * Удаление проекта с проверкой удаления у пользователя
   */
  deleteProject(): void {
    if (!confirm("Вы точно хотите удалить проект?")) {
      return;
    }

    this.projectsEditInfoService.deleteProject();
  }

  /**
   * Сохранение проекта как опубликованного с проверкой доп. полей
   */
  saveProjectAsPublished(): void {
    this.projectsEditInfoService.saveProjectAsPublished();
  }

  /**
   * Сохранение проекта как черновика
   */
  saveProjectAsDraft(): void {
    this.projectsEditInfoService.saveProjectAsDraft();
  }

  /**
   * Отправка формы проекта
   */
  submitProjectForm(): void {
    this.projectsEditInfoService.submitProjectForm();
  }

  // Методы для работы с модальными окнами
  closeWarningModal(): void {
    this.projectsEditUIInfoService.applyCloseWarningModal();
  }

  closeSendingDescisionModal(): void {
    this.projectsEditInfoService.closeSendingDescisionModal();
  }
}
