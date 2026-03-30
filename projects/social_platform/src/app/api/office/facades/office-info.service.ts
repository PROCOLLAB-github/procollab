/** @format */

import { inject, Injectable } from "@angular/core";
import { map, Subject, takeUntil, tap } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { ChatService } from "../../chat/chat.service";
import { Invite } from "@domain/invite/invite.model";
import { OfficeUIInfoService } from "./ui/office-ui-info.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { RejectInviteUseCase } from "../../invite/use-cases/reject-invite.use-case";
import { AcceptInviteUseCase } from "../../invite/use-cases/accept-invite.use-case";

@Injectable()
export class OfficeInfoService {
  private readonly industryRepository = inject(IndustryRepositoryPort);
  private readonly route = inject(ActivatedRoute);
  private readonly authRepository = inject(AuthRepositoryPort);

  private readonly rejectInviteUseCase = inject(RejectInviteUseCase);
  private readonly acceptInviteUseCase = inject(AcceptInviteUseCase);

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
    this.authRepository.profile
      .pipe(
        tap(profile => {
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
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
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
    this.rejectInviteUseCase
      .execute(inviteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.officeUIInfoService.applyOpenInviteErrorModal();
            return;
          }

          this.invites.update(invites => invites.filter(invite => invite.id !== inviteId));
        },
      });
  }

  onAcceptInvite(inviteId: number): void {
    const invite = this.invites().find(i => i.id === inviteId);
    if (!invite) return;

    this.acceptInviteUseCase
      .execute(inviteId)
      .pipe(
        tap(result => {
          if (!result.ok) {
            this.officeUIInfoService.applyOpenInviteErrorModal();
            return;
          }

          this.invites.update(invites => invites.filter(invite => invite.id !== inviteId));

          this.router
            .navigateByUrl(`/office/projects/${invite.project.id}`)
            .then(() => this.logger.debug("Route changed from SidebarComponent"));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  onLogout() {
    this.authRepository
      .logout()
      .pipe(
        tap(() => {
          this.router
            .navigateByUrl("/auth")
            .then(() => this.logger.debug("Route changed from OfficeComponent"));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
