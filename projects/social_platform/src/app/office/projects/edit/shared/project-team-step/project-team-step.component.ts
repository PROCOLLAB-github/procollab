/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { InputComponent, ButtonComponent, SelectComponent } from "@ui/components";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "@error/models/error-message";
import { InviteCardComponent } from "@office/shared/invite-card/invite-card.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ProjectTeamService } from "../../services/project-team.service";
import { rolesMembersList } from "projects/core/src/consts/list-roles-members";
import { ActivatedRoute } from "@angular/router";
import { IconComponent } from "@uilib";

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
    SelectComponent,
    ControlErrorPipe,
    InviteCardComponent,
    ModalComponent,
  ],
})
export class ProjectTeamStepComponent implements OnInit {
  private readonly projectTeamService = inject(ProjectTeamService);
  private readonly route = inject(ActivatedRoute);

  readonly errorMessage = ErrorMessage;

  // Константы для селектов
  readonly rolesMembersList = rolesMembersList;

  ngOnInit(): void {
    this.projectTeamService.setInvites(this.invites);

    // Настраиваем динамическую валидацию
    this.projectTeamService.setupDynamicValidation();
  }

  // Геттеры для формы
  get inviteForm(): FormGroup {
    return this.projectTeamService.getInviteForm();
  }

  get role() {
    return this.projectTeamService.role;
  }

  get link() {
    return this.projectTeamService.link;
  }

  get specialization() {
    return this.projectTeamService.specialization;
  }

  // Геттеры для данных
  get invites() {
    return this.projectTeamService.getInvites();
  }

  get invitesFill() {
    return this.projectTeamService.invitesFill;
  }

  get isInviteModalOpen() {
    return this.projectTeamService.isInviteModalOpen;
  }

  get inviteNotExistingError() {
    return this.projectTeamService.inviteNotExistingError;
  }

  get inviteSubmitInitiated() {
    return this.projectTeamService.inviteSubmitInitiated;
  }

  get inviteFormIsSubmitting() {
    return this.projectTeamService.inviteFormIsSubmitting;
  }

  /**
   * Открытие модального окна приглашения
   */
  openInviteModal(): void {
    this.projectTeamService.openInviteModal();
  }

  /**
   * Закрытие модального окна приглашения
   */
  closeInviteModal(): void {
    this.projectTeamService.closeInviteModal();
  }

  /**
   * Отправка приглашения
   */
  submitInvite(): void {
    const projectId = Number(this.route.snapshot.paramMap.get("projectId"));
    this.projectTeamService.submitInvite(projectId);
  }

  /**
   * Редактирование приглашения
   */
  editInvitation(params: { inviteId: number; role: string; specialization: string }): void {
    this.projectTeamService.editInvitation(params);
  }

  /**
   * Удаление приглашения
   */
  removeInvitation(invitationId: number): void {
    this.projectTeamService.removeInvitation(invitationId);
  }

  /**
   * Обработка изменения состояния модального окна
   */
  onModalOpenChange(open: boolean): void {
    if (!open) {
      this.closeInviteModal();
    }
  }
}
