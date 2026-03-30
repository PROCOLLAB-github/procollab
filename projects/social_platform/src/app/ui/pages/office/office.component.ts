/** @format */

import { AsyncPipe } from "@angular/common";
import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  ChangeDetectionStrategy,
  DestroyRef,
} from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { ProgramSidebarCardComponent } from "@ui/widgets/program-sidebar-card/program-sidebar-card.component";
import { ButtonComponent } from "@ui/primitives";
import { DeleteConfirmComponent } from "@ui/primitives/delete-confirm/delete-confirm.component";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { NavComponent } from "@ui/widgets/nav/nav.component";
import { SnackbarComponent } from "@ui/primitives/snackbar/snackbar.component";
import { ProfileControlPanelComponent, SidebarComponent } from "@uilib";
import { ChatService } from "@api/chat/chat.service";
import { GetActualProgramsUseCase } from "@api/program/use-cases/get-actual-programs.use-case";
import { Program } from "@domain/program/program.model";
import { OfficeInfoService } from "@api/office/facades/office-info.service";
import { OfficeUIInfoService } from "@api/office/facades/ui/office-ui-info.service";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";

/**
 * Главный компонент офиса - корневой компонент рабочего пространства
 * Управляет общим состоянием приложения, навигацией и модальными окнами
 *
 * Принимает:
 * - Данные о приглашениях через резолвер
 * - События от сервисов (auth, chat, invite)
 *
 * Возвращает:
 * - Рендерит основной интерфейс офиса с сайдбаром, навигацией и роутер-аутлетом
 * - Управляет модальными окнами для верификации и приглашений
 */
@Component({
  selector: "app-office",
  templateUrl: "./office.component.html",
  styleUrl: "./office.component.scss",
  standalone: true,
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
  providers: [OfficeInfoService, OfficeUIInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficeComponent implements OnInit, OnDestroy {
  private readonly officeInfoService = inject(OfficeInfoService);
  private readonly officeUIInfoService = inject(OfficeUIInfoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly getActualProgramsUseCase = inject(GetActualProgramsUseCase);
  public readonly authRepository = inject(AuthInfoService);
  public readonly chatService = inject(ChatService);
  private readonly profile = toSignal(this.authRepository.profile, { initialValue: null });

  readonly invites = this.officeInfoService.invites;

  readonly waitVerificationModal = this.officeUIInfoService.waitVerificationModal;
  readonly waitVerificationAccepted = this.officeUIInfoService.waitVerificationAccepted;

  showRegisteredProgramModal = signal<boolean>(false);

  registeredProgramToShow?: Program | null = null;

  readonly inviteErrorModal = this.officeUIInfoService.inviteErrorModal;

  readonly programs = signal<Program[]>([]);

  readonly navItems = this.officeUIInfoService.navItems;

  ngOnInit(): void {
    this.officeInfoService.initializationOffice();

    if (localStorage.getItem("waitVerificationAccepted") === "true") {
      this.waitVerificationAccepted.set(true);
    }

    this.getActualProgramsUseCase
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          if (!result.ok) {
            return;
          }

          const programs = result.value.results;
          const resultPrograms = programs.filter(
            (program: Program) => Date.now() < Date.parse(program.datetimeRegistrationEnds)
          );
          this.programs.set(resultPrograms.slice(0, 3));
          this.tryShowRegisteredProgramModal();
        },
      });
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
    this.officeInfoService.onLogout();
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
