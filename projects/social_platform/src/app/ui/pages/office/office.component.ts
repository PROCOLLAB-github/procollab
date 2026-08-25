/** @format */

import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import { ProgramSidebarCardComponent } from "./program-sidebar-card/program-sidebar-card.component";
import { ButtonComponent } from "@ui/primitives";
import { DeleteConfirmComponent } from "./delete-confirm/delete-confirm.component";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { NavComponent } from "./nav/nav.component";
import { SnackbarComponent } from "./snackbar/snackbar.component";
import { ProfileControlPanelComponent, SidebarComponent } from "@uilib";
import { OfficeInfoService } from "@api/office/facades/office-info.service";
import { OfficeUIInfoService } from "@api/office/facades/ui/office-ui-info.service";
import { AppRoutes } from "@api/paths/app-routes";
import { ChatUnreadStateService } from "@api/chat/chat-unread-state.service";
import { AuthRegisterService } from "@api/auth/facades/auth-register.service";
import { AuthUIInfoService } from "@api/auth/facades/ui/auth-ui-info.service";
import { ProgramShellInfoService } from "@api/program/facades/program-shell-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";

/** Корневой компонент рабочего пространства с навигацией и управлением состоянием. */
@Component({
  selector: "app-office",
  templateUrl: "./office.component.html",
  styleUrl: "./office.component.scss",
  imports: [
    SidebarComponent,
    NavComponent,
    RouterOutlet,
    ModalComponent,
    ButtonComponent,
    DeleteConfirmComponent,
    SnackbarComponent,
    RouterLink,
    ProfileControlPanelComponent,
    ProgramSidebarCardComponent,
  ],
  providers: [OfficeInfoService, OfficeUIInfoService, AuthUIInfoService, AuthRegisterService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficeComponent implements OnInit {
  private readonly officeInfoService = inject(OfficeInfoService);
  private readonly officeUIInfoService = inject(OfficeUIInfoService);
  private readonly authRegisterService = inject(AuthRegisterService);
  public readonly chatUnreadState = inject(ChatUnreadStateService);
  private readonly programShellInfoService = inject(ProgramShellInfoService);
  private readonly profileInfoService = inject(ProfileInfoService);

  protected readonly profile = this.profileInfoService.profile;

  protected readonly invites = this.officeInfoService.invites;

  protected readonly waitVerificationModal = this.officeUIInfoService.waitVerificationModal;
  protected readonly verificationAcknowledgementPending =
    this.officeUIInfoService.verificationAcknowledgementPending;

  protected readonly inviteErrorModal = this.officeUIInfoService.inviteErrorModal;

  protected readonly programs = this.programShellInfoService.actualPrograms;

  protected readonly navItems = this.officeUIInfoService.navItems;
  protected readonly AppRoutes = AppRoutes;

  protected currentYear = signal(new Date().getFullYear());

  ngOnInit(): void {
    this.officeInfoService.initializationOffice();
    this.programShellInfoService.ensureProgramsLoaded();
  }

  onAcceptWaitVerification() {
    this.officeInfoService.onAcknowledgeVerificationNotice();
  }

  onRejectInvite(inviteId: number): void {
    this.officeInfoService.onRejectInvite(inviteId);
  }

  onAcceptInvite(inviteId: number): void {
    this.officeInfoService.onAcceptInvite(inviteId);
  }

  onLogout() {
    this.programShellInfoService.invalidatePrograms();
    this.officeInfoService.onLogout();
  }

  downloadPolicy(event: Event): void {
    event.stopPropagation();
    this.authRegisterService.downloadPolicy();
  }
}
