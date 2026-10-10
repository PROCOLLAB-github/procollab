/** @format */

import { inject as injectReleaseLayout } from "@angular/core";
import { DesktopLayoutService as ReleaseDesktopLayoutService } from "../../../../../../../../../ui/src/lib/services/desktop-layout.service";

import { StateComponent } from "@uilib";

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { ButtonComponent, IconComponent } from "@ui/primitives";
import { InviteCardComponent } from "./invite-card/invite-card.component";
import { CollaboratorCardComponent } from "./collaborator-card/collaborator-card.component";
import { isLoading } from "@domain/shared/async-state";
import { ProjectTeamService } from "@api/project/facades/edit/project-team.service";
import { ProjectTeamUIService } from "@api/project/facades/edit/ui/project-team-ui.service";
import { ProjectsEditInfoService } from "@api/project/facades/edit/projects-edit-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ProjectMemberInviteModalComponent } from "@ui/widgets/project-invite/project-member-invite-modal.component";

/** Команда проекта: участники, ожидающие приглашения и фактические роли. */
@Component({
  selector: "app-project-team-step",
  templateUrl: "./project-team-step.component.html",
  styleUrl: "./project-team-step.component.scss",
  imports: [
    StateComponent,
    ButtonComponent,
    IconComponent,
    InviteCardComponent,
    CollaboratorCardComponent,
    ProjectMemberInviteModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectTeamStepComponent implements OnInit, OnDestroy {
  protected readonly releaseDesktop = injectReleaseLayout(ReleaseDesktopLayoutService).desktop;

  private readonly projectsEditInfoService = inject(ProjectsEditInfoService);
  private readonly projectTeamService = inject(ProjectTeamService);
  private readonly projectTeamUIService = inject(ProjectTeamUIService);
  protected readonly currentUser = inject(ProfileInfoService).profile;
  protected inviteTrigger: HTMLElement | null = null;
  protected readonly invitationProject = this.projectsEditInfoService.invitationProject;
  protected readonly collaborators = this.projectTeamUIService.collaborators;
  protected readonly pendingInvites = computed(() =>
    this.projectTeamUIService.invites().filter(invite => invite.isAccepted === null),
  );
  protected readonly teamLoading = this.projectTeamUIService.teamLoading;
  protected readonly onlyCurrentUser = computed(
    () =>
      this.collaborators().length === 1 &&
      this.collaborators()[0].userId === this.currentUser()?.id,
  );
  protected readonly isInviteModalOpen = this.projectTeamUIService.isInviteModalOpen;
  protected readonly isLoading = isLoading;
  protected readonly inviteFormIsSubmitting = this.projectTeamUIService.inviteFormIsSubmitting;
  protected readonly projectId = this.projectsEditInfoService.profileId;

  ngOnInit(): void {
    this.projectTeamService.setupDynamicValidation();
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
}
