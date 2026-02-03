/** @format */

import { AsyncPipe } from "@angular/common";
import { Component, OnDestroy, OnInit, signal, Signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from "@angular/router";
import { ProgramSidebarCardComponent } from "@ui/shared/program-sidebar-card/program-sidebar-card.component";
import { ButtonComponent } from "@ui/components";
import { DeleteConfirmComponent } from "@ui/components/delete-confirm/delete-confirm.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { NavComponent } from "@ui/components/nav/nav.component";
import { SnackbarComponent } from "@ui/components/snackbar/snackbar.component";
import { ProfileControlPanelComponent, SidebarComponent } from "@uilib";
import { IndustryService } from "../../../api/industry/industry.service";
import { AuthService } from "../../../api/auth";
import { InviteService } from "../../../api/invite/invite.service";
import { ChatService } from "../../../api/chat/chat.service";
import { ProgramService } from "../../../api/program/program.service";
import { Invite } from "../../../domain/invite/invite.model";
import { toSignal } from "@angular/core/rxjs-interop";
import { forkJoin, map, noop, Subscription } from "rxjs";
import { User } from "../../../domain/auth/user.model";
import { Program } from "../../../domain/program/program.model";

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
})
export class OfficeComponent implements OnInit, OnDestroy {
  constructor(
    private readonly industryService: IndustryService,
    private readonly route: ActivatedRoute,
    public readonly authService: AuthService,
    private readonly inviteService: InviteService,
    private readonly router: Router,
    public readonly chatService: ChatService,
    private readonly programService: ProgramService
  ) {}

  invites: Signal<Invite[]> = toSignal(
    this.route.data.pipe(
      map(r => r["invites"]),
      map(invites => invites.filter((invite: Invite) => invite.isAccepted === null))
    )
  );

  profile?: User;

  waitVerificationModal = false;
  waitVerificationAccepted = false;

  showRegisteredProgramModal = signal<boolean>(false);

  registeredProgramToShow?: Program | null = null;

  inviteErrorModal = false;

  protected readonly programs = signal<Program[]>([]);

  navItems: {
    name: string;
    icon: string;
    link: string;
    isExternal?: boolean;
    isActive?: boolean;
  }[] = [];

  subscriptions$: Subscription[] = [];

  ngOnInit(): void {
    const globalSubscription$ = forkJoin([this.industryService.getAll()]).subscribe(noop);
    this.subscriptions$.push(globalSubscription$);

    const profileSub$ = this.authService.profile.subscribe(profile => {
      this.profile = profile;
      this.buildNavItems(profile);

      if (!this.profile.doesCompleted()) {
        this.router
          .navigateByUrl("/office/onboarding")
          .then(() => console.debug("Route changed from OfficeComponent"));
      } else if (this.profile.verificationDate === null) {
        this.waitVerificationModal = true;
      }
    });
    this.subscriptions$.push(profileSub$);

    this.chatService.connect().subscribe(() => {
      this.chatService.onSetOffline().subscribe(evt => {
        this.chatService.setOnlineStatus(evt.userId, false);
      });

      this.chatService.onSetOnline().subscribe(evt => {
        this.chatService.setOnlineStatus(evt.userId, true);
      });
    });

    if (!this.router.url.includes("chats")) {
      this.chatService.hasUnreads().subscribe(unreads => {
        this.chatService.unread$.next(unreads);
      });
    }

    if (localStorage.getItem("waitVerificationAccepted") === "true") {
      this.waitVerificationAccepted = true;
    }

    const programsSub$ = this.programService.getActualPrograms().subscribe({
      next: ({ results: programs }) => {
        const resultPrograms = programs.filter(
          (program: Program) => Date.now() < Date.parse(program.datetimeRegistrationEnds)
        );
        this.programs.set(resultPrograms.slice(0, 3));
        this.tryShowRegisteredProgramModal();
      },
    });

    this.subscriptions$.push(programsSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  onAcceptWaitVerification() {
    this.waitVerificationAccepted = true;
    localStorage.setItem("waitVerificationAccepted", "true");
  }

  onRejectInvite(inviteId: number): void {
    this.inviteService.rejectInvite(inviteId).subscribe({
      next: () => {
        const index = this.invites().findIndex(invite => invite.id === inviteId);
        this.invites().splice(index, 1);
      },
      error: () => {
        this.inviteErrorModal = true;
      },
    });
  }

  onAcceptInvite(inviteId: number): void {
    this.inviteService.acceptInvite(inviteId).subscribe({
      next: () => {
        const index = this.invites().findIndex(invite => invite.id === inviteId);
        const invite = JSON.parse(JSON.stringify(this.invites()[index]));
        this.invites().splice(index, 1);

        this.router
          .navigateByUrl(`/office/projects/${invite.project.id}`)
          .then(() => console.debug("Route changed from SidebarComponent"));
      },
      error: () => {
        this.inviteErrorModal = true;
      },
    });
  }

  onLogout() {
    this.authService
      .logout()
      .subscribe(() =>
        this.router
          .navigateByUrl("/auth")
          .then(() => console.debug("Route changed from OfficeComponent"))
      );
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
    return `program_registered_modal_seen_${programId}`;
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

  private buildNavItems(profile: User) {
    this.navItems = [
      { name: "мой профиль", icon: "person", link: `profile/${profile.id}` },
      { name: "новости", icon: "feed", link: "feed" },
      { name: "проекты", icon: "projects", link: "projects" },
      { name: "участники", icon: "people-bold", link: "members" },
      { name: "программы", icon: "program", link: "program" },
      { name: "вакансии", icon: "search-sidebar", link: "vacancies" },
      {
        name: "траектории",
        icon: "trajectories",
        link: "skills",
        isExternal: true,
        isActive: false,
      },
      { name: "чаты", icon: "message", link: "chats" },
    ];
  }
}
