/** @format */

import { Component, OnDestroy, OnInit, Signal } from "@angular/core";
import { IndustryService } from "@services/industry.service";
import { forkJoin, map, noop, Subscription } from "rxjs";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { Invite } from "@models/invite.model";
import { AuthService } from "@auth/services";
import { ProjectService } from "@services/project.service";
import { User } from "@auth/models/user.model";
import { ChatService } from "@services/chat.service";
import { SnackbarComponent } from "@ui/components/snackbar/snackbar.component";
import { DeleteConfirmComponent } from "@ui/components/delete-confirm/delete-confirm.component";
import { ButtonComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { NavComponent } from "./features/nav/nav.component";
import { IconComponent, ProfileControlPanelComponent, SidebarComponent } from "@uilib";
import { AsyncPipe } from "@angular/common";
import { InviteService } from "@services/invite.service";
import { toSignal } from "@angular/core/rxjs-interop";

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
    ProfileControlPanelComponent,
    IconComponent,
  ],
})
export class OfficeComponent implements OnInit, OnDestroy {
  constructor(
    private readonly industryService: IndustryService,
    private readonly route: ActivatedRoute,
    public readonly authService: AuthService,
    private readonly inviteService: InviteService,
    private readonly router: Router,
    public readonly chatService: ChatService
  ) {}

  ngOnInit(): void {
    const globalSubscription$ = forkJoin([this.industryService.getAll()]).subscribe(noop);
    this.subscriptions$.push(globalSubscription$);

    const profileSub$ = this.authService.profile.subscribe(profile => {
      this.profile = profile;

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
      // Change users online status
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
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  invites: Signal<Invite[]> = toSignal(
    this.route.data.pipe(
      map(r => r["invites"]),
      map(invites => invites.filter((invite: Invite) => invite.isAccepted === null))
    )
  );

  navItems = [
    { name: "новости", icon: "feed", link: "feed" },
    { name: "проекты", icon: "projects", link: "projects" },
    { name: "участники", icon: "people-bold", link: "members" },
    { name: "программы", icon: "program", link: "program" },
    { name: "вакансии", icon: "search-sidebar", link: "vacancies" },
    { name: "траектории", icon: "trajectories", link: "skills", isExternal: true, isActive: false },
    { name: "чаты", icon: "message", link: "chats" },
  ];

  subscriptions$: Subscription[] = [];

  waitVerificationModal = false;
  waitVerificationAccepted = false;

  inviteErrorModal = false;

  profile?: User;

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
}
