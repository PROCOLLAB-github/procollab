/** @format */

import { Component, Input, inject, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { directionProjectList } from "projects/core/src/consts/lists/direction-project-list.const";
import { trackProjectList } from "projects/core/src/consts/lists/track-project-list.const";
import { AvatarControlComponent } from "@ui/components/avatar-control/avatar-control.component";
import { InputComponent, SelectComponent, ButtonComponent } from "@ui/components";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { UploadFileComponent } from "@ui/components/upload-file/upload-file.component";
import { AsyncPipe, CommonModule } from "@angular/common";
import { ControlErrorPipe } from "@corelib";
import { ProjectFormService } from "../../../../../../api/project/project-form.service";
import { IconComponent } from "@uilib";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { RouterLink } from "@angular/router";
import { generateOptionsList } from "@utils/generate-options-list";
import { ProjectsEditInfoService } from "projects/social_platform/src/app/api/project/facades/edit/projects-edit-info.service";
import { ProjectsEditUIInfoService } from "projects/social_platform/src/app/api/project/facades/edit/ui/projects-edit-ui-info.service";
import { ProjectGoalsUIService } from "projects/social_platform/src/app/api/project/facades/edit/ui/project-goals-ui.service";
import { ProjectGoalService } from "projects/social_platform/src/app/api/project/facades/edit/project-goals.service";
import { ProjectContactsService } from "projects/social_platform/src/app/api/project/facades/edit/project-contacts.service";
import { ProjectTeamUIService } from "projects/social_platform/src/app/api/project/facades/edit/ui/project-team-ui.service";

@Component({
  selector: "app-project-main-step",
  templateUrl: "./project-main-step.component.html",
  styleUrl: "./project-main-step.component.scss",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvatarControlComponent,
    InputComponent,
    SelectComponent,
    IconComponent,
    TextareaComponent,
    ButtonComponent,
    UploadFileComponent,
    AsyncPipe,
    ControlErrorPipe,
    ModalComponent,
    AvatarComponent,
    FormsModule,
    RouterLink,
  ],
  standalone: true,
})
export class ProjectMainStepComponent implements OnInit, OnDestroy {
  @Input() projSubmitInitiated = false;

  private readonly fb = inject(FormBuilder);
  private readonly projectFormService = inject(ProjectFormService);
  private readonly projectTeamUIService = inject(ProjectTeamUIService);

  private readonly projectsEditInfoService = inject(ProjectsEditInfoService);
  private readonly projectsEditUIInfoService = inject(ProjectsEditUIInfoService);

  private readonly projectGoalService = inject(ProjectGoalService);
  private readonly projectGoalsUIService = inject(ProjectGoalsUIService);

  private readonly projectContactsService = inject(ProjectContactsService);

  protected readonly projectId = this.projectsEditInfoService.profileId;

  // Получаем форму из сервиса
  protected readonly projectForm = this.projectsEditInfoService.projectForm;
  protected readonly goalForm = this.projectGoalService.getForm();

  // Id Лидера проекта
  protected readonly leaderId = this.projectsEditUIInfoService.leaderId;
  protected readonly industries$ = this.projectsEditInfoService.industries$;

  protected readonly goalLeaderShowModal = this.projectGoalsUIService.goalLeaderShowModal;
  protected readonly activeGoalIndex = this.projectGoalsUIService.activeGoalIndex;
  protected readonly selectedLeaderId = this.projectGoalsUIService.selectedLeaderId;

  protected readonly errorMessage = ErrorMessage;
  protected readonly trackList = trackProjectList;
  protected readonly directionList = directionProjectList;
  protected readonly trlList = generateOptionsList(9, "numbers");

  // Геттеры для удобного доступа к контролам формы
  protected readonly name = this.projectFormService.name;
  protected readonly region = this.projectFormService.region;

  protected readonly industry = this.projectFormService.industry;
  protected readonly description = this.projectFormService.description;

  protected readonly actuality = this.projectFormService.actuality;
  protected readonly implementationDeadline = this.projectFormService.implementationDeadline;

  protected readonly problem = this.projectFormService.problem;
  protected readonly targetAudience = this.projectFormService.targetAudience;
  protected readonly trl = this.projectFormService.trl;

  protected readonly partnerProgramId = this.projectFormService.partnerProgramId;
  protected readonly presentationAddress = this.projectFormService.presentationAddress;

  protected readonly coverImageAddress = this.projectFormService.coverImageAddress;
  protected readonly imageAddress = this.projectFormService.imageAddress;

  // Геттеры для работы со ссылками
  protected readonly link = this.projectContactsService.link;
  protected readonly links = this.projectContactsService.links;

  // Геттеры для работы с целями
  protected readonly goals = this.projectGoalService.goals;
  protected readonly goalItems = this.projectGoalsUIService.goalItems;
  protected readonly goalName = this.projectGoalService.goalName;
  protected readonly goalDate = this.projectGoalService.goalDate;
  protected readonly goalLeader = this.projectGoalService.goalLeader;
  protected readonly editIndex = this.projectFormService.editIndex;
  protected readonly collaborators = this.projectTeamUIService.collaborators;

  /**
   * Проверяет, есть ли ссылки для отображения
   */
  protected readonly hasLinks = this.projectContactsService.hasLinks;

  /**
   * Проверяет, есть ли цели для отображения
   */
  protected readonly hasGoals = this.projectGoalsUIService.hasGoals;

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.projectsEditInfoService.destroy();
    this.projectGoalService.destroy();
  }

  /**
   * Добавление ссылки
   */
  addLink(): void {
    this.projectContactsService.addLink(this.links);
  }

  /**
   * Редактирование ссылки
   * @param index - индекс ссылки
   */
  editLink(index: number): void {
    this.projectContactsService.editLink(index, this.links, this.projectForm);
  }

  /**
   * Удаление ссылки
   * @param index - индекс ссылки
   */
  removeLink(index: number): void {
    this.projectContactsService.removeLink(index, this.links);
  }

  /**
   * Добавление цели
   */
  addGoal(goalName?: string, goalDate?: string, goalLeader?: string): void {
    this.goals.push(
      this.fb.group({
        title: [goalName, [Validators.required]],
        completionDate: [goalDate, [Validators.required]],
        responsible: [goalLeader, [Validators.required]],
      })
    );

    this.projectGoalService.addGoal(goalName, goalDate, goalLeader);
  }

  /**
   * Удаление цели
   * @param index - индекс цели
   */
  removeGoal(index: number, goalId: number): void {
    this.projectGoalService.removeGoal(index, goalId, this.projectId());
  }

  /**
   * Получить выбранного лидера для конкретной цели
   */
  getSelectedLeaderForGoal(goalIndex: number) {
    return this.projectGoalService.getSelectedLeaderForGoal(goalIndex, this.collaborators());
  }

  /**
   * Обработчик изменения радио-кнопки для выбора лидера
   */
  onLeaderRadioChange(event: Event): void {
    this.projectGoalsUIService.applyOnLeaderRadioChange(event);
  }

  /**
   * Добавление лидера на определенную цель
   */
  addLeader(): void {
    this.projectGoalsUIService.applyAddLeaderToGoal(this.goals);
  }

  /**
   * Переключатель для модалки выбора лидера
   */
  toggleGoalLeaderModal(index?: number): void {
    this.projectGoalsUIService.applyToggleGoalLeaderModal(this.goals, index);
  }

  protected trackByIndex(index: number): number {
    return index;
  }
}
