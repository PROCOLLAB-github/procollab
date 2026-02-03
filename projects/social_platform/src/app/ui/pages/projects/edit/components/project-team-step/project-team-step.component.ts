/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { InputComponent, ButtonComponent } from "@ui/components";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { InviteCardComponent } from "@ui/components/invite-card/invite-card.component";
import { rolesMembersList } from "projects/core/src/consts/lists/roles-members-list.const";
import { IconComponent } from "@uilib";
import { CollaboratorCardComponent } from "@ui/shared/collaborator-card/collaborator-card.component";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { ToggleFieldsInfoService } from "projects/social_platform/src/app/api/toggle-fields/toggle-fields-info.service";
import { TooltipInfoService } from "projects/social_platform/src/app/api/tooltip/tooltip-info.service";
import { ProjectTeamService } from "projects/social_platform/src/app/api/project/facades/edit/project-team.service";
import { ProjectTeamUIService } from "projects/social_platform/src/app/api/project/facades/edit/ui/project-team-ui.service";
import { ProjectsEditInfoService } from "projects/social_platform/src/app/api/project/facades/edit/projects-edit-info.service";
import { ModalComponent } from "@ui/components/modal/modal.component";

@Component({
  selector: "app-project-team-step",
  templateUrl: "./project-team-step.component.html",
  styleUrl: "./project-team-step.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    IconComponent,
    ControlErrorPipe,
    InviteCardComponent,
    CollaboratorCardComponent,
    TooltipComponent,
    ModalComponent,
  ],
})
export class ProjectTeamStepComponent implements OnInit {
  private readonly projectsEditInfoService = inject(ProjectsEditInfoService);
  private readonly projectTeamService = inject(ProjectTeamService);
  private readonly projectTeamUIService = inject(ProjectTeamUIService);
  private readonly tooltipInfoService = inject(TooltipInfoService);
  private readonly toggleFieldsInfoService = inject(ToggleFieldsInfoService);

  // Константы для селектов
  protected readonly rolesMembersList = rolesMembersList;
  protected readonly showInputFields = this.toggleFieldsInfoService.showInputFields;

  // Геттеры для формы
  protected readonly inviteForm = this.projectTeamUIService.inviteForm;

  protected readonly role = this.projectTeamUIService.role;
  protected readonly link = this.projectTeamUIService.link;
  protected readonly specialization = this.projectTeamUIService.specialization;

  // Геттеры для данных
  protected readonly invites = this.projectTeamUIService.invites;
  protected readonly collaborators = this.projectTeamUIService.collaborators;
  protected readonly invitesFill = this.projectTeamUIService.invitesFill;

  protected readonly isInviteModalOpen = this.projectTeamUIService.isInviteModalOpen;
  protected readonly inviteNotExistingError = this.projectTeamUIService.inviteNotExistingError;
  protected readonly inviteSubmitInitiated = this.projectTeamUIService.inviteSubmitInitiated;
  protected readonly inviteFormIsSubmitting = this.projectTeamUIService.inviteFormIsSubmitting;

  protected readonly projectId = this.projectsEditInfoService.profileId;

  /** Наличие подсказки */
  protected readonly haveHint = this.tooltipInfoService.haveHint;

  protected readonly isHintTeamVisible = this.tooltipInfoService.isHintTeamVisible;
  protected readonly isHintTeamModal = this.projectTeamUIService.isHintTeamModal;

  /** Позиция подсказки */
  protected readonly tooltipPosition = this.tooltipInfoService.tooltipPosition;

  /** Состояние видимости подсказки */
  protected readonly isTooltipVisible = this.tooltipInfoService.isTooltipVisible;

  protected readonly errorMessage = ErrorMessage;

  ngOnInit(): void {
    // Настраиваем динамическую валидацию
    this.projectTeamService.setupDynamicValidation();
  }

  /** Показать подсказку */
  toggleTooltip(option: "show" | "hide"): void {
    option === "show"
      ? this.tooltipInfoService.showTooltip()
      : this.tooltipInfoService.hideTooltip();
  }

  /**
   * Открытие блоков для создания приглашения
   */
  createInvitationBlock(): void {
    this.toggleFieldsInfoService.showFields();
  }

  /**
   * Открытие модального окна приглашения
   */
  openInviteModal(): void {
    this.projectTeamUIService.applyOpenInviteModal();
  }

  /**
   * Закрытие модального окна приглашения
   */
  closeInviteModal(): void {
    this.projectTeamUIService.applyCloseInviteModal();
  }

  /**
   * Отправка приглашения
   */
  submitInvite(): void {
    if (this.link?.value!.trim() || this.role?.value!.trim()) {
      this.projectTeamService.submitInvite(this.projectId());
      this.toggleFieldsInfoService.hideFields();
      return;
    }

    this.toggleFieldsInfoService.showFields();
  }

  /**
   * Редактирование приглашения
   */
  editInvitation(params: { inviteId: number; role: string; specialization: string }): void {
    this.projectTeamUIService.applyEditInvitation(params);
  }

  /**
   * Удаление приглашения
   */
  removeInvitation(invitationId: number): void {
    this.projectTeamUIService.applyRemoveInvitation(invitationId);
  }

  /**
   * Обработка изменения состояния модального окна
   */
  onModalOpenChange(open: boolean): void {
    if (!open) {
      this.closeInviteModal();
    }
  }

  onCollaboratorRemove(collaboratorId: number): void {
    this.projectTeamUIService.applyRemoveCollaborator(collaboratorId);
  }

  openHintModal(event: Event): void {
    event.preventDefault();
    this.tooltipInfoService.hideTooltip("team");
    this.projectTeamUIService.applyOpenHintModal();
  }
}
