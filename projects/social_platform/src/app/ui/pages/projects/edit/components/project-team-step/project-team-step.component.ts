/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy } from "@angular/core";
import { ButtonComponent } from "@ui/primitives";
import { InviteCardComponent } from "./invite-card/invite-card.component";
import { IconComponent } from "@uilib";
import { CollaboratorCardComponent } from "./collaborator-card/collaborator-card.component";
import { TooltipComponent } from "@ui/primitives/tooltip/tooltip.component";
import { isLoading } from "@domain/shared/async-state";
import { TooltipInfoService } from "@api/tooltip/tooltip-info.service";
import { ProjectTeamService } from "@api/project/facades/edit/project-team.service";
import { ProjectTeamUIService } from "@api/project/facades/edit/ui/project-team-ui.service";
import { ProjectsEditInfoService } from "@api/project/facades/edit/projects-edit-info.service";
import { ProjectMemberInviteModalComponent } from "@ui/widgets/project-invite/project-member-invite-modal.component";
import { ModalComponent } from "@ui/primitives/modal/modal.component";

/** Шаг редактирования проекта: команда. */
@Component({
  selector: "app-project-team-step",
  templateUrl: "./project-team-step.component.html",
  styleUrl: "./project-team-step.component.scss",
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    InviteCardComponent,
    CollaboratorCardComponent,
    TooltipComponent,
    ModalComponent,
    ProjectMemberInviteModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectTeamStepComponent implements OnInit, OnDestroy {
  private readonly projectsEditInfoService = inject(ProjectsEditInfoService);
  private readonly projectTeamService = inject(ProjectTeamService);
  private readonly projectTeamUIService = inject(ProjectTeamUIService);
  protected readonly tooltipInfoService = inject(TooltipInfoService);

  protected inviteTrigger: HTMLElement | null = null;
  protected readonly invitationProject = this.projectsEditInfoService.invitationProject;

  // Геттеры для данных
  protected readonly invites = this.projectTeamUIService.invites;
  protected readonly collaborators = this.projectTeamUIService.collaborators;
  protected readonly invitesFill = this.projectTeamUIService.invitesFill;

  protected readonly isInviteModalOpen = this.projectTeamUIService.isInviteModalOpen;
  protected readonly isLoading = isLoading;
  protected readonly inviteFormIsSubmitting = this.projectTeamUIService.inviteFormIsSubmitting;

  protected readonly projectId = this.projectsEditInfoService.profileId;

  /** Наличие подсказки */
  protected readonly haveHint = this.tooltipInfoService.haveHint;

  protected isHintTeamVisible = this.tooltipInfoService.isVisible;
  protected readonly isHintTeamModal = this.projectTeamUIService.isHintTeamModal;

  /** Позиция подсказки */
  protected readonly tooltipPosition = this.tooltipInfoService.tooltipPosition;

  /** Состояние видимости подсказки */
  protected readonly isTooltipVisible = this.tooltipInfoService.isVisible;

  ngOnInit(): void {
    // Настраиваем динамическую валидацию
    this.projectTeamService.setupDynamicValidation();
  }

  /** Показать подсказку */
  toggleTooltip(key: "base" | "team"): void {
    this.tooltipInfoService.toggleTooltip(key);
  }

  openInviteModal(event: Event): void {
    this.inviteTrigger =
      (event.currentTarget as HTMLElement).querySelector("button") ??
      (event.currentTarget as HTMLElement);
    this.projectTeamUIService.applyOpenInviteModal();
  }

  closeInviteModal(): void {
    this.projectTeamUIService.applyCloseInviteModal();
  }

  ngOnDestroy(): void {
    this.closeInviteModal();
  }

  editInvitation(params: { inviteId: number; role: string; specialization: string }): void {
    this.projectTeamService.editInvitation(params);
  }

  removeInvitation(invitationId: number): void {
    this.projectTeamService.removeInvitation(invitationId);
  }

  onCollaboratorRemove(collaboratorId: number): void {
    this.projectTeamUIService.applyRemoveCollaborator(collaboratorId);
  }

  openHintModal(event: Event): void {
    event.preventDefault();
    this.tooltipInfoService.toggleTooltip("team");
    this.projectTeamUIService.applyOpenHintModal();
  }
}
