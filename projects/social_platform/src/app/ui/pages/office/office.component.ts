/** @format */

import { AsyncPipe } from "@angular/common";
import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  effect,
  inject,
  ChangeDetectionStrategy,
  DestroyRef,
} from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { ProgramSidebarCardComponent } from "./program-sidebar-card/program-sidebar-card.component";
import { ButtonComponent } from "@ui/primitives";
import { DeleteConfirmComponent } from "./delete-confirm/delete-confirm.component";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { NavComponent } from "./nav/nav.component";
import { SnackbarComponent } from "./snackbar/snackbar.component";
import { ProfileControlPanelComponent, SidebarComponent } from "@uilib";
import { Program } from "@domain/program/program.model";
import { OfficeInfoService } from "@api/office/facades/office-info.service";
import { OfficeUIInfoService } from "@api/office/facades/ui/office-ui-info.service";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";
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
        AsyncPipe,
        RouterLink,
        ProfileControlPanelComponent,
        ProgramSidebarCardComponent,
    ],
    providers: [OfficeInfoService, OfficeUIInfoService, AuthUIInfoService, AuthRegisterService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfficeComponent implements OnInit, OnDestroy {
  private readonly officeInfoService = inject(OfficeInfoService);
  private readonly officeUIInfoService = inject(OfficeUIInfoService);
  private readonly authRegisterService = inject(AuthRegisterService);
  public readonly chatUnreadState = inject(ChatUnreadStateService);
  private readonly programShellInfoService = inject(ProgramShellInfoService);
  private readonly profileInfoService = inject(ProfileInfoService);

  protected readonly profile = this.profileInfoService.profile;

  protected readonly invites = this.officeInfoService.invites;

  protected readonly waitVerificationModal = this.officeUIInfoService.waitVerificationModal;
  protected readonly waitVerificationAccepted = this.officeUIInfoService.waitVerificationAccepted;

  protected readonly showRegisteredProgramModal = signal<boolean>(false);

  protected registeredProgramToShow?: Program | null = null;

  protected readonly inviteErrorModal = this.officeUIInfoService.inviteErrorModal;

  protected readonly programs = this.programShellInfoService.actualPrograms;

  protected readonly navItems = this.officeUIInfoService.navItems;
  protected readonly AppRoutes = AppRoutes;

  protected currentYear = signal(new Date().getFullYear());

  // effect в field initializer — здесь есть injection-контекст (в ngOnInit его нет → NG0203).
  private readonly registeredProgramEffect = effect(() => {
    const programs = this.programs();
    if (programs && programs.length) {
      this.tryShowRegisteredProgramModal();
    }
  });

  ngOnInit(): void {
    this.officeInfoService.initializationOffice();

    if (localStorage.getItem("waitVerificationAccepted") === "true") {
      this.waitVerificationAccepted.set(true);
    }

    this.programShellInfoService.ensureProgramsLoaded();
  }

  ngOnDestroy(): void {
    this.officeInfoService.destroy();
  }

  onAcceptWaitVerification() {
    this.officeUIInfoService.applyAcceptWaitVerification();
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

  private tryShowRegisteredProgramModal(): void {
    const programs = this.programs();
    if (!programs || programs.length === 0) return;

    const memberProgram = programs.find(p => p.isUserMember);
    if (!memberProgram) return;

    if (this.hasSeenRegisteredProgramModal(memberProgram.id)) return;

    this.registeredProgramToShow = memberProgram;
    this.showRegisteredProgramModal.set(true);
    this.markSeenRegisteredProgramModal(memberProgram.id);
  }

  private getRegisteredProgramSeenKey(programId: number): string {
    return `program_${this.profile()?.id}_registered_modal_seen_${programId}`;
  }

  private hasSeenRegisteredProgramModal(programId: number): boolean {
    try {
      return !!localStorage.getItem(this.getRegisteredProgramSeenKey(programId));
    } catch (e) {
      return false;
    }
  }

  private markSeenRegisteredProgramModal(programId: number): void {
    try {
      localStorage.setItem(this.getRegisteredProgramSeenKey(programId), "1");
    } catch (e) {
      // ignore storage errors
    }
  }
}
