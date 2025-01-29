/** @format */

import { Component, OnDestroy, OnInit, signal, Signal } from "@angular/core";
import { IndustryService } from "@services/industry.service";
import { forkJoin, map, noop, Subscription, tap } from "rxjs";
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
import { NavComponent } from "./shared/nav/nav.component";
import {
  IconComponent,
  ProfileControlPanelComponent,
  SidebarComponent,
  SubscriptionPlansComponent,
} from "@uilib";
import { AsyncPipe } from "@angular/common";
import { InviteService } from "@services/invite.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { SubscriptionPlan, SubscriptionPlansService } from "@corelib";

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
    SubscriptionPlansComponent,
  ],
})
export class OfficeComponent implements OnInit, OnDestroy {
  constructor(
    private readonly industryService: IndustryService,
    private readonly route: ActivatedRoute,
    public readonly authService: AuthService,
    private readonly projectService: ProjectService,
    private readonly inviteService: InviteService,
    private readonly router: Router,
    public readonly chatService: ChatService,
    private readonly subscriptionPlansService: SubscriptionPlansService
  ) {}

  ngOnInit(): void {
    const globalSubscription$ = forkJoin([
      this.industryService.getAll(),
      this.projectService.getProjectSteps(),
    ]).subscribe(noop);
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

    const subscriptionsSub$ = this.subscriptionPlansService
      .getSubscriptions()
      .pipe(
        map(subscription => {
          if (Array.isArray(subscription)) {
            return subscription;
          } else return [subscription];
        })
      )
      .subscribe(subscriptions => {
        this.subscriptions.set(subscriptions);
      });
    this.subscriptions$.push(subscriptionsSub$);
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
    { name: "Новости", icon: "feed", link: "feed" },
    { name: "Проекты", icon: "projects-filled", link: "projects" },
    { name: "Программы", icon: "program", link: "program/list" },
    { name: "Участники", icon: "people-bold", link: "members" },
    { name: "Эксперты", icon: "two-people", link: "mentors" },
    { name: "Вакансии", icon: "search-sidebar", link: "vacancies" },
  ];

  subscriptions$: Subscription[] = [];

  waitVerificationModal = false;
  waitVerificationAccepted = false;

  profile?: User;

  onAcceptWaitVerification() {
    this.waitVerificationAccepted = true;
    localStorage.setItem("waitVerificationAccepted", "true");
  }

  onRejectInvite(inviteId: number): void {
    this.inviteService.rejectInvite(inviteId).subscribe(() => {
      const index = this.invites().findIndex(invite => invite.id === inviteId);
      this.invites().splice(index, 1);
    });
  }

  onAcceptInvite(inviteId: number): void {
    this.inviteService.acceptInvite(inviteId).subscribe(() => {
      const index = this.invites().findIndex(invite => invite.id === inviteId);
      const invite = JSON.parse(JSON.stringify(this.invites()[index]));
      this.invites().splice(index, 1);

      this.router
        .navigateByUrl(`/office/projects/${invite.project.id}`)
        .then(() => console.debug("Route changed from SidebarComponent"));
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

  openSubscription = signal(false);
  subscriptions = signal<SubscriptionPlan[]>([]);

  openSkills() {
    location.href = "https://skills.procollab.ru";
  }
}
