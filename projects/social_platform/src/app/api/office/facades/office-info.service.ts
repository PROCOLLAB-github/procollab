/** @format */

import { inject, Injectable } from "@angular/core";
import { Subject, takeUntil, tap } from "rxjs";
import { Router } from "@angular/router";
import { OfficeUIInfoService } from "./ui/office-ui-info.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { AppRoutes } from "@api/paths/app-routes";
import { CheckUnreadsUseCase } from "@api/chat/use-cases/check-unreads.use-case";
import { ConnectChatUseCase } from "@api/chat/use-cases/connect-chat.use-case";
import { ObserveSetOfflineUseCase } from "@api/chat/use-cases/observe-set-offline.use-case";
import { ObserveSetOnlineUseCase } from "@api/chat/use-cases/observe-set-online.use-case";
import { ChatStateService } from "@api/chat/chat-state.service";
import { InviteInfoService } from "@api/invite/invite-info.service";

/**
 * Стартовый сервис офисной оболочки: прогревает справочники, собирает навигацию,
 * подключает чатовые статусы и обрабатывает приглашения пользователя.
 */
@Injectable()
export class OfficeInfoService {
  private readonly industryRepository = inject(IndustryRepositoryPort);
  private readonly authRepository = inject(AuthRepositoryPort);
  private readonly inviteInfoService = inject(InviteInfoService);

  private readonly checkUnreadsUseCase = inject(CheckUnreadsUseCase);
  private readonly connectChatUseCase = inject(ConnectChatUseCase);
  private readonly observeSetOfflineUseCase = inject(ObserveSetOfflineUseCase);
  private readonly observeSetOnlineUseCase = inject(ObserveSetOnlineUseCase);

  private readonly router = inject(Router);
  private readonly chatStateService = inject(ChatStateService);
  private readonly officeUIInfoService = inject(OfficeUIInfoService);
  private readonly logger = inject(LoggerService);

  readonly invites = this.inviteInfoService.invites;

  private readonly destroy$ = new Subject<void>();

  initializationOffice(): void {
    // Справочник отраслей нужен многим дочерним страницам синхронно через сигнал.
    this.industryRepository.getAll().pipe(takeUntil(this.destroy$)).subscribe();

    this.initializationNavItems();

    this.initializationInvites();

    this.initializationStatus();

    if (!this.router.url.includes("chats")) {
      this.checkUnreadsUseCase
        .execute()
        .pipe(takeUntil(this.destroy$))
        .subscribe(result => {
          if (!result.ok) {
            return;
          }

          this.chatStateService.setUnread(result.value);
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
              .navigateByUrl(AppRoutes.onboarding.root())
              .then(() => this.logger.debug("Route changed from OfficeComponent"));
          } else if (
            profile?.relations.verificationDate === null &&
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
    this.connectChatUseCase.execute().pipe(takeUntil(this.destroy$)).subscribe();

    // События входа/выхода из сети обновляют общий кеш для карточек и detail-виджетов.
    this.observeSetOfflineUseCase
      .execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe(evt => {
        this.chatStateService.setOnlineStatus(evt.userId, false);
      });

    this.observeSetOnlineUseCase
      .execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe(evt => {
        this.chatStateService.setOnlineStatus(evt.userId, true);
      });
  }

  private initializationInvites(): void {
    this.inviteInfoService.ensureLoaded();
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRejectInvite(inviteId: number): void {
    this.inviteInfoService
      .rejectInviteAction(inviteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) {
          this.officeUIInfoService.applyOpenInviteErrorModal();
        }
      });
  }

  onAcceptInvite(inviteId: number): void {
    const invite = this.invites().find(i => i.id === inviteId);
    if (!invite) return;

    this.inviteInfoService
      .acceptInviteAction(inviteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) {
          this.officeUIInfoService.applyOpenInviteErrorModal();
          return;
        }

        this.router
          .navigateByUrl(AppRoutes.projects.detail(invite.project.id))
          .then(() => this.logger.debug("Route changed after accept invite"));
      });
  }

  onLogout() {
    this.authRepository
      .logout()
      .pipe(
        tap(() => {
          this.router
            .navigateByUrl(AppRoutes.auth.login())
            .then(() => this.logger.debug("Route changed from OfficeComponent"));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
