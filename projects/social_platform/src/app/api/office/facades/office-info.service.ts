/** @format */

import { inject, Injectable } from "@angular/core";
import { map, Subject, takeUntil } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { InviteRepository } from "../../../infrastructure/repository/invite/invite.repository";
import { ChatService } from "../../chat/chat.service";
import { Invite } from "../../../domain/invite/invite.model";
import { OfficeUIInfoService } from "./ui/office-ui-info.service";
import { LoggerService } from "projects/core/src/lib/services/logger/logger.service";
import { AuthRepository } from "../../../infrastructure/repository/auth/auth.repository";
import { IndustryRepository } from "../../../infrastructure/repository/industry/industry.repository";

@Injectable()
export class OfficeInfoService {
  private readonly industryRepository = inject(IndustryRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly authRepository = inject(AuthRepository);
  private readonly inviteService = inject(InviteRepository);
  private readonly router = inject(Router);
  private readonly chatService = inject(ChatService);
  private readonly officeUIInfoService = inject(OfficeUIInfoService);
  private readonly logger = inject(LoggerService);

  readonly invites = this.officeUIInfoService.invites;

  private readonly destroy$ = new Subject<void>();

  initializationOffice(): void {
    this.industryRepository.getAll().pipe(takeUntil(this.destroy$)).subscribe();

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
    this.authRepository.profile.pipe(takeUntil(this.destroy$)).subscribe(profile => {
      this.officeUIInfoService.applyCreateNavItems(profile.id);

      if (!profile?.doesCompleted()) {
        this.router
          .navigateByUrl("/office/onboarding")
          .then(() => this.logger.debug("Route changed from OfficeComponent"));
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
            .then(() => this.logger.debug("Route changed from SidebarComponent"));
        },
        error: () => {
          this.officeUIInfoService.applyOpenInviteErrorModal();
        },
      });
  }

  onLogout() {
    this.authRepository
      .logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() =>
        this.router
          .navigateByUrl("/auth")
          .then(() => this.logger.debug("Route changed from OfficeComponent"))
      );
  }
}
