/** @format */

import { computed, DestroyRef, inject, Injectable, Injector, signal } from "@angular/core";
import { catchError, EMPTY, filter, finalize, map, tap } from "rxjs";
import { NavigationEnd, Router } from "@angular/router";
import { OfficeUIInfoService } from "./ui/office-ui-info.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { AppRoutes } from "@api/paths/app-routes";
import { ChatUnreadStateService } from "@api/chat/chat-unread-state.service";
import { InviteInfoService } from "@api/invite/facades/invite-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { IndustryStateInfoService } from "@api/industry/facades/industry-state-info.service";
import { ConnectChatUseCase } from "@api/chat/use-cases/connect-chat.use-case";
import { ObserveSetOfflineUseCase } from "@api/chat/use-cases/observe-set-offline.use-case";
import { ObserveSetOnlineUseCase } from "@api/chat/use-cases/observe-set-online.use-case";
import { ChatStateService } from "@domain/shared/chat-state.service";
import { EventBus } from "@domain/shared/event-bus";
import { loggedOut } from "@domain/auth/events/logged-out.event";
import { ProgramShellInfoService } from "@api/program/facades/program-shell-info.service";
import { takeUntilDestroyed, toObservable, toSignal } from "@angular/core/rxjs-interop";

function isExpertEntry(url: string, hasEvaluationAccess: boolean | undefined): boolean {
  return (
    hasEvaluationAccess === true &&
    (url.startsWith("/office/evaluation") ||
      /^\/office\/program\/\d+\/(?:projects-rating|solutions-rating|solutions\/\d+\/evaluation)(?:[/?#]|$)/.test(
        url,
      ))
  );
}

/** Стартовый сервис офисной оболочки: справочники, навигация, чат-статусы, приглашения. */
@Injectable()
export class OfficeInfoService {
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);
  private readonly destroyRef = inject(DestroyRef);

  private readonly authRepository = inject(AuthRepositoryPort);
  private readonly inviteInfoService = inject(InviteInfoService);
  private readonly industryStateInfoService = inject(IndustryStateInfoService);
  private readonly programShellInfoService = inject(ProgramShellInfoService);
  private readonly officeUIInfoService = inject(OfficeUIInfoService);
  private readonly profileInfoService = inject(ProfileInfoService);

  private readonly chatUnreadState = inject(ChatUnreadStateService);
  private readonly connectChatUseCase = inject(ConnectChatUseCase);
  private readonly observeSetOfflineUseCase = inject(ObserveSetOfflineUseCase);
  private readonly observeSetOnlineUseCase = inject(ObserveSetOnlineUseCase);
  private readonly chatStateService = inject(ChatStateService);

  readonly invites = this.inviteInfoService.invites;
  private readonly profile = this.profileInfoService.profile;
  private readonly officeUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  readonly verificationNoticeError = signal(false);
  readonly waitVerificationModal = computed(() => {
    const url = this.officeUrl();
    const profile = this.profile();
    return (
      profile !== null &&
      profile.doesCompleted() &&
      !/^\/office\/program\/\d+(?:[/?#;]|$)/.test(url) &&
      !isExpertEntry(url, profile.relations.hasEvaluationAccess) &&
      profile.relations.isActive === true &&
      profile.relations.verificationDate === null &&
      profile.relations.verificationNoticeAcknowledgedAt === null
    );
  });

  initializationOffice(): void {
    this.profileInfoService.ensureProfileLoaded();

    // Справочник отраслей нужен многим дочерним страницам синхронно через сигнал.
    this.industryStateInfoService.ensureLoaded();

    this.initializationNavItems();

    this.initializationInvites();

    this.initializationStatus();

    if (!this.router.url.includes("chats")) {
      this.chatUnreadState.ensureLoaded();
    }
  }

  private initializationNavItems(): void {
    toObservable(this.profile, { injector: this.injector })
      .pipe(
        filter(profile => !!profile),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(profile => {
        this.officeUIInfoService.applyCreateNavItems(profile!.id);
        if (
          !profile!.doesCompleted() &&
          !isExpertEntry(this.router.url, profile!.relations.hasEvaluationAccess)
        ) {
          this.router
            .navigateByUrl(AppRoutes.onboarding.root())
            .then(() => this.logger.debug("Route changed from OfficeComponent"));
        }
      });
  }

  onAcknowledgeVerificationNotice(): void {
    if (
      !this.waitVerificationModal() ||
      this.officeUIInfoService.verificationAcknowledgementPending()
    ) {
      return;
    }

    this.verificationNoticeError.set(false);
    this.officeUIInfoService.verificationAcknowledgementPending.set(true);
    this.authRepository
      .acknowledgeVerificationNotice()
      .pipe(
        finalize(() => this.officeUIInfoService.verificationAcknowledgementPending.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: profile => this.profileInfoService.applyProfileUpdated(profile),
        error: () => this.verificationNoticeError.set(true),
      });
  }

  private initializationStatus(): void {
    this.connectChatUseCase.execute().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    // События входа/выхода из сети обновляют общий кеш для карточек и detail-виджетов.
    this.observeSetOfflineUseCase
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(evt => {
        this.chatStateService.setOnlineStatus(evt.userId, false);
      });

    this.observeSetOnlineUseCase
      .execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(evt => {
        this.chatStateService.setOnlineStatus(evt.userId, true);
      });
  }

  private initializationInvites(): void {
    this.inviteInfoService.ensureLoaded();
  }

  onRejectInvite(inviteId: number): void {
    this.inviteInfoService
      .rejectInviteAction(inviteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) {
          // InviteInfoService показывает ошибку и перечитывает список.
        }
      });
  }

  onAcceptInvite(inviteId: number): void {
    const invite = this.invites().find(i => i.id === inviteId);
    if (!invite) return;

    this.inviteInfoService
      .acceptInviteAction(inviteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) {
          // InviteInfoService показывает ошибку и перечитывает список.
          return;
        }

        this.router
          .navigateByUrl(AppRoutes.projects.detail(invite.project.id))
          .then(() => this.logger.debug("Route changed after accept invite"));
      });
  }

  onLogout() {
    this.eventBus.emit(loggedOut());
    this.inviteInfoService.invalidate();
    this.profileInfoService.invalidateProfile();
    this.profileInfoService.invalidateLeaderProjects();
    this.chatUnreadState.invalidate();
    this.programShellInfoService.invalidatePrograms();

    this.authRepository
      .logout()
      .pipe(
        catchError(() => EMPTY),
        tap(() => {
          this.router
            .navigateByUrl(AppRoutes.auth.login())
            .then(() => this.logger.debug("Route changed from OfficeComponent"));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
