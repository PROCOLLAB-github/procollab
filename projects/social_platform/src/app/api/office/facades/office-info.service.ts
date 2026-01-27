/** @format */

import { inject, Injectable } from "@angular/core";
import { map, Subject, takeUntil } from "rxjs";
import { IndustryService } from "../../industry/industry.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../auth";
import { InviteService } from "../../invite/invite.service";
import { ChatService } from "../../chat/chat.service";
import { Invite } from "../../../domain/invite/invite.model";
import { OfficeUIInfoService } from "./ui/office-ui-info.service";

@Injectable()
export class OfficeInfoService {
  private readonly industryService = inject(IndustryService);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly inviteService = inject(InviteService);
  private readonly router = inject(Router);
  private readonly chatService = inject(ChatService);
  private readonly officeUIInfoService = inject(OfficeUIInfoService);

  readonly invites = this.officeUIInfoService.invites;

  private readonly destroy$ = new Subject<void>();

  initializationOffice(): void {
    this.industryService.getAll().pipe(takeUntil(this.destroy$)).subscribe();

    this.initializationNavItems();

    this.initializationInvites();

    this.initializationStatus();

    if (!this.router.url.includes("chats")) {
      this.chatService
        .hasUnreads()
        .pipe(takeUntil(this.destroy$))
        .subscribe(unreads => {
          this.chatService.unread$.next(unreads);
        });
    }

    this.officeUIInfoService.applyVerificationModal();
  }

  private initializationNavItems(): void {
    this.authService.profile.pipe(takeUntil(this.destroy$)).subscribe(profile => {
      this.officeUIInfoService.applyCreateNavItems(profile.id);

      if (!profile?.doesCompleted()) {
        this.router
          .navigateByUrl("/office/onboarding")
          .then(() => console.debug("Route changed from OfficeComponent"));
      } else if (
        profile?.verificationDate === null &&
        localStorage.getItem("waitVerificationAccepted") !== "true"
      ) {
        this.officeUIInfoService.applyOpenVerificationModal();
      }
    });
  }

  private initializationStatus(): void {
    this.chatService.connect().pipe(takeUntil(this.destroy$)).subscribe();

    this.chatService
      .onSetOffline()
      .pipe(takeUntil(this.destroy$))
      .subscribe(evt => {
        this.chatService.setOnlineStatus(evt.userId, false);
      });

    this.chatService
      .onSetOnline()
      .pipe(takeUntil(this.destroy$))
      .subscribe(evt => {
        this.chatService.setOnlineStatus(evt.userId, true);
      });
  }

  private initializationInvites(): void {
    this.route.data
      .pipe(
        map(r => r["invites"]),
        map(invites => invites.filter((invite: Invite) => invite.isAccepted === null)),
        takeUntil(this.destroy$)
      )
      .subscribe(invites => {
        this.officeUIInfoService.applySetInvites(invites);
      });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRejectInvite(inviteId: number): void {
    this.inviteService
      .rejectInvite(inviteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.invites.update(invites => invites.filter(invite => invite.id !== inviteId));
        },
        error: () => {
          this.officeUIInfoService.applyOpenInviteErrorModal();
        },
      });
  }

  onAcceptInvite(inviteId: number): void {
    const invite = this.invites().find(i => i.id === inviteId);
    if (!invite) return;

    this.inviteService
      .acceptInvite(inviteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.invites.update(invites => invites.filter(invite => invite.id !== inviteId));

          this.router
            .navigateByUrl(`/office/projects/${invite.project.id}`)
            .then(() => console.debug("Route changed from SidebarComponent"));
        },
        error: () => {
          this.officeUIInfoService.applyOpenInviteErrorModal();
        },
      });
  }

  onLogout() {
    this.authService
      .logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() =>
        this.router
          .navigateByUrl("/auth")
          .then(() => console.debug("Route changed from OfficeComponent"))
      );
  }
}
