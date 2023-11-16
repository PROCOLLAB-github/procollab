/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { IndustryService } from "@services/industry.service";
import { forkJoin, map, noop, Observable, Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { Invite } from "@models/invite.model";
import { AuthService } from "@auth/services";
import { ProjectService } from "@services/project.service";
import { User } from "@auth/models/user.model";
import { ChatService } from "@services/chat.service";

@Component({
  selector: "app-office",
  templateUrl: "./office.component.html",
  styleUrls: ["./office.component.scss"],
})
export class OfficeComponent implements OnInit, OnDestroy {
  constructor(
    private readonly industryService: IndustryService,
    private readonly route: ActivatedRoute,
    public readonly authService: AuthService,
    private readonly projectService: ProjectService,
    private readonly router: Router,
    public readonly chatService: ChatService
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
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  invites$: Observable<Invite[]> = this.route.data.pipe(
    map(r => r["invites"]),
    map(invites => invites.filter((invite: Invite) => invite.isAccepted === null))
  );

  subscriptions$: Subscription[] = [];

  waitVerificationModal = false;
  waitVerificationAccepted = false;

  profile?: User;

  onAcceptWaitVerification() {
    this.waitVerificationAccepted = true;
    localStorage.setItem("waitVerificationAccepted", "true");
  }
}
