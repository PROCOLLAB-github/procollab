/** @format */

import { CommonModule, Location } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ButtonComponent, InputComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { RouterModule } from "@angular/router";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { ReactiveFormsModule } from "@angular/forms";
import { ApproveSkillComponent } from "../approve-skill/approve-skill.component";
import { ControlErrorPipe } from "@corelib";
import { TruncatePipe } from "projects/core/src/lib/pipes/formatters/truncate.pipe";
import { ProfileService } from "../../../api/auth/profile.service";
import { ChatService } from "../../../api/chat/chat.service";
import { ProjectFormService } from "../../../api/project/project-form.service";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { ProjectAdditionalService } from "../../../api/project/facades/edit/project-additional.service";
import { TooltipInfoService } from "../../../api/tooltip/tooltip-info.service";
import { DetailInfoService } from "./services/detail-info.service";
import { DetailProfileInfoService } from "./services/profile/detail-profile-info.service";
import { DetailProgramInfoService } from "./services/program/detail-program-info.service";
import { DetailProjectInfoService } from "./services/project/detail-project-info.service";
import { Program } from "../../../domain/program/program.model";
import { ProfileDetailUIInfoService } from "../../../api/profile/facades/detail/ui/profile-detail-ui-info.service";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    IconComponent,
    ButtonComponent,
    ModalComponent,
    AvatarComponent,
    TooltipComponent,
    ApproveSkillComponent,
    InputComponent,
    TruncatePipe,
    ControlErrorPipe,
  ],
  providers: [
    ProfileDetailUIInfoService,
    DetailInfoService,
    DetailProfileInfoService,
    DetailProjectInfoService,
    DetailProgramInfoService,
    ProjectAdditionalService,
    TooltipInfoService,
  ],
  standalone: true,
})
export class DeatilComponent implements OnInit, OnDestroy {
  private readonly projectAdditionalService = inject(ProjectAdditionalService);
  protected readonly location = inject(Location);
  public readonly skillsProfileService = inject(ProfileService);
  public readonly chatService = inject(ChatService);
  private readonly projectFormService = inject(ProjectFormService);
  private readonly tooltipInfoService = inject(TooltipInfoService);

  private readonly detailInfoService = inject(DetailInfoService);
  private readonly detailProfileInfoService = inject(DetailProfileInfoService);
  private readonly detailProgramInfoService = inject(DetailProgramInfoService);
  private readonly detailProjectInfoService = inject(DetailProjectInfoService);

  protected readonly info = this.detailInfoService.info;
  protected readonly profile = this.detailProfileInfoService.profile;
  protected readonly profileProjects = this.detailProfileInfoService.profileProjects;
  protected readonly listType = this.detailInfoService.listType;

  // Переменная для подсказок
  protected readonly isTooltipVisible = this.tooltipInfoService.isTooltipVisible;

  // Переменные для отображения данных в зависимости от url
  protected readonly isProjectsPage = this.detailProgramInfoService.isProjectsPage;
  protected readonly isMembersPage = this.detailProgramInfoService.isMembersPage;
  protected readonly isProjectsRatingPage = this.detailProgramInfoService.isProjectsRatingPage;

  protected readonly isTeamPage = this.detailProjectInfoService.isTeamPage;
  protected readonly isVacanciesPage = this.detailProjectInfoService.isVacanciesPage;
  protected readonly isProjectChatPage = this.detailProjectInfoService.isProjectChatPage;
  protected readonly isProjectWorkSectionPage =
    this.detailProjectInfoService.isProjectWorkSectionPage;

  protected readonly isKanbanBoardPage = this.detailProjectInfoService.isKanbanBoardPage;
  protected readonly isGantDiagramPage = this.detailProjectInfoService.isGantDiagramPage;

  // Сторонние переменные для работы с роутингом или доп проверок
  protected readonly backPath = this.detailInfoService.backPath;
  protected readonly registerDateExpired = this.detailProgramInfoService.registerDateExpired;
  protected readonly submissionProjectDateExpired =
    this.detailProjectInfoService.submissionProjectDateExpired;
  protected readonly isInProject = this.detailInfoService.isInProject;

  protected readonly isSended = this.detailProfileInfoService.isSended;
  protected readonly isProfileFill = this.detailProfileInfoService.isProfileFill;

  // Переменные для работы с модалкой подачи проекта
  protected readonly selectedProjectId = this.detailProfileInfoService.selectedProjectId;
  protected readonly memberProjects = this.detailProfileInfoService.memberProjects;

  protected readonly userType = this.detailInfoService.userType;

  // Сигналы для работы с модальными окнами с текстом
  protected readonly errorMessageModal = this.detailInfoService.errorMessageModal;

  protected readonly additionalFields = this.detailProgramInfoService.additionalFields;

  // Переменные для работы с модалками
  protected readonly isAssignProjectToProgramModalOpen =
    this.detailProgramInfoService.isAssignProjectToProgramModalOpen;
  protected readonly isProgramEndedModalOpen =
    this.detailProgramInfoService.isProgramEndedModalOpen;
  protected readonly isProgramSubmissionProjectsEndedModalOpen =
    this.detailProgramInfoService.isProgramSubmissionProjectsEndedModalOpen;
  protected readonly isLeaveProjectModalOpen =
    this.detailProjectInfoService.isLeaveProjectModalOpen; // Флаг модального окна выхода
  protected readonly isEditDisable = this.detailProjectInfoService.isEditDisable; // Флаг недоступности редактирования
  protected readonly isEditDisableModal = this.detailProjectInfoService.isEditDisableModal; // Флаг недоступности редактирования для модалки
  protected readonly openSupport = this.detailProjectInfoService.openSupport; // Флаг модального окна поддержки
  protected readonly leaderLeaveModal = this.detailProjectInfoService.leaderLeaveModal; // Флаг модального окна предупреждения лидера
  protected readonly isDelayModalOpen = this.detailProfileInfoService.isDelayModalOpen;

  // Переменные для работы с подтверждением навыков
  protected readonly showApproveSkillModal = this.detailProfileInfoService.showApproveSkillModal;
  protected readonly showSendInviteModal = this.detailProfileInfoService.showSendInviteModal;
  protected readonly showNoProjectsModal = this.detailProfileInfoService.showNoProjectsModal;
  protected readonly showActiveInviteModal = this.detailProfileInfoService.showActiveInviteModal;
  protected readonly showNoInProgramModal = this.detailProfileInfoService.showNoInProgramModal;
  protected readonly showSuccessInviteModal = this.detailProfileInfoService.showSuccessInviteModal;

  protected readonly openSkills = this.detailProfileInfoService.openSkills;

  // Геттеры для работы с отображением данных разного типа доступа
  protected readonly isUserManager = this.detailInfoService.isUserManager;
  protected readonly isUserMember = this.detailInfoService.isUserMember;
  protected readonly isUserExpert = this.detailInfoService.isUserExpert;
  protected readonly isProjectAssigned = this.detailInfoService.isProjectAssigned;

  // Сигналы для работы с модальными окнами с текстом
  protected readonly assignProjectToProgramModalMessage =
    this.detailProgramInfoService.assignProjectToProgramModalMessage;

  protected readonly projectForm = this.projectFormService.getForm();

  protected readonly inviteForm = this.detailProfileInfoService.inviteForm;

  protected readonly errorMessage = ErrorMessage;

  ngOnInit(): void {
    this.detailInfoService.initializationDetail();
  }

  ngOnDestroy(): void {
    this.detailInfoService.destroy();
    this.detailProfileInfoService.destroy();
    this.detailProgramInfoService.destroy();
    this.detailProjectInfoService.destroy();
  }

  // Методы для управления состоянием ошибок через сервис
  setAssignProjectToProgramError(error: { non_field_errors: string[] }): void {
    this.projectAdditionalService.setAssignProjectToProgramError(error);
  }

  toggleTooltip(option: "show" | "hide"): void {
    option === "show"
      ? this.tooltipInfoService.showTooltip()
      : this.tooltipInfoService.hideTooltip();
  }

  /**
   * Обработчик изменения радио-кнопки для выбора проекта
   */
  onProjectRadioChange(event: Event): void {
    this.detailProfileInfoService.onProjectRadioChange(event);
  }

  addNewProject(programId: number): void {
    this.detailProgramInfoService.addNewProject(programId);
  }

  /**
   * Закрытие модального окна выхода из проекта
   */
  onCloseLeaveProjectModal(): void {
    this.detailProjectInfoService.onCloseLeaveProjectModal();
  }

  /**
   * Закрытие модального окна для невозможности редактировать проект
   */
  onUnableEditingProject(): void {
    this.detailProjectInfoService.onUnableEditingProject();
  }

  /**
   * Выход из проекта
   */
  onLeave() {
    this.detailProjectInfoService.onLeave();
  }

  /**
   * Копирование ссылки на профиль в буфер обмена
   */
  onCopyLink(profileId: number): void {
    this.detailProfileInfoService.onCopyLink(profileId);
  }

  /**
   * Открытие модального окна с информацией о подтверждениях навыка
   * @param skillId - идентификатор навыка
   */
  onOpenSkill(skillId: number) {
    this.openSkills[skillId] = !this.openSkills[skillId];
  }

  onCloseModal(skillId: number) {
    this.openSkills[skillId] = false;
  }

  /**
   * Отправка CV пользователя на email
   * Проверяет ограничения по времени и отправляет CV на почту пользователя
   */
  downloadCV() {
    this.detailProfileInfoService.downloadCV();
  }

  /**
   * Открывает модалку для отправки приглашения пользователю
   * Проверяет какие отрендерить проекты где profile.id === leader
   */
  inviteUser(): void {
    this.detailProfileInfoService.inviteUser();
  }

  sendInvite(): void {
    this.detailProfileInfoService.sendInvite();
  }

  /**
   * Перенаправляет на страницу с информацией в завивисимости от listType
   */
  redirectDetailInfo(): void {
    this.detailInfoService.redirectDetailInfo();
  }

  routingToMyProjects(): void {
    this.detailProjectInfoService.routingToMyProjects();
  }

  /**
   * Проверка завершения программы перед регистрацией
   */
  checkPrograRegistrationEnded(event: Event, program: Program): void {
    this.detailProgramInfoService.checkPrograRegistrationEnded(event, program);
  }
}
