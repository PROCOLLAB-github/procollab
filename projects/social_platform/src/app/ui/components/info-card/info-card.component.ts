/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  Output,
} from "@angular/core";
import { IndustryService } from "projects/social_platform/src/app/api/industry/industry.service";
import { IconComponent, ButtonComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { AsyncPipe, CommonModule } from "@angular/common";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { SubscriptionService } from "projects/social_platform/src/app/api/subsriptions/subscription.service";
import { InviteService } from "projects/social_platform/src/app/api/invite/invite.service";
import { ClickOutsideModule } from "ng-click-outside";
import { Router, RouterLink } from "@angular/router";
import { TagComponent } from "@ui/components/tag/tag.component";
import { YearsFromBirthdayPipe } from "@corelib";
import { TruncatePipe } from "projects/core/src/lib/pipes/formatters/truncate.pipe";
import { LoggerService } from "projects/core/src/lib/services/logger/logger.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/**
 * Компонент карточки информации с разным наполнением, в зависимости от контекста
 */
@Component({
  selector: "app-info-card",
  templateUrl: "./info-card.component.html",
  styleUrl: "./info-card.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    AvatarComponent,
    IconComponent,
    AsyncPipe,
    ModalComponent,
    ButtonComponent,
    ClickOutsideModule,
    TagComponent,
    YearsFromBirthdayPipe,
    TruncatePipe,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoCardComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly inviteService = inject(InviteService);
  private readonly subscriptionService = inject(SubscriptionService);
  public readonly industryService = inject(IndustryService);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);

  @Input() info?: any;
  @Input() type: "invite" | "projects" | "members" | "rating" = "projects";
  @Input() appereance: "my" | "subs" | "base" | "empty" = "base";
  @Input() section: "projects" | "subscriptions" | "other" = "projects";
  @Input() canDelete?: boolean | null = false;
  @Input() isSubscribed?: boolean | null = false;
  @Input() profileId?: number;
  @Input() leaderId?: number;
  @Input() loggedUserId?: number;

  @Output() onAcceptingInvite = new EventEmitter<number>();
  @Output() onRejectingInvite = new EventEmitter<number>();
  @Output() onCreate = new EventEmitter<void>();
  @Output() onRemoveCollaborator = new EventEmitter<number>();

  // Состояние компонента
  isUnsubscribeModalOpen = false;
  inviteErrorModal = false;
  haveBadge = this.calculateHaveBadge();

  programProjectHovered = false;
  iconHovered = false;
  draftProjectHovered = false;

  removeCollaboratorFromProject(userId: number): void {
    this.onRemoveCollaborator.emit(userId);
  }

  /**
   * Определяет, нужно ли показывать информацию о проекте
   */
  shouldShowProjectInfo(): boolean {
    return this.type === "projects" && this.appereance !== "subs" && this.appereance !== "empty";
  }

  /**
   * Определяет, нужно ли показывать бейдж подписки
   */
  shouldShowSubscriptionBadge(): boolean {
    return (
      this.appereance !== "empty" &&
      this.haveBadge &&
      this.appereance === "base" &&
      this.type !== "invite" &&
      this.type !== "members"
    );
  }

  /**
   * Возвращает URL для аватара
   */
  getAvatarUrl(): string {
    const currentImageAddress =
      this.appereance === "empty" && this.section === "projects"
        ? "/assets/images/projects/shared/add-project.svg"
        : this.appereance === "empty" && this.section === "subscriptions"
        ? "/assets/images/projects/shared/empty-subscriptions.svg"
        : "";
    return this.info?.imageAddress || this.info?.avatar || currentImageAddress;
  }

  /**
   * Переключение подписки (универсальный метод)
   */
  toggleSubscription(event: Event): void {
    if (this.isSubscribed) {
      this.onSubscribe(event, this.profileId!);
    } else {
      this.onSubscribe(event, this.profileId!);
    }
  }

  /**
   * Обработка отклонения приглашения
   */
  onRejectInvite(event: Event, inviteId: number): void {
    if (!this.info || !inviteId) {
      this.logger.warn("Cannot reject invite: missing project or inviteId");
      return;
    }

    this.stopEventPropagation(event);

    this.inviteService
      .rejectInvite(inviteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.onRejectingInvite.emit(inviteId || this.info!.inviteId);
        },
        error: error => {
          this.logger.error("Error rejecting invite:", error);
          this.inviteErrorModal = true;
        },
      });
  }

  /**
   * Обработка принятия приглашения
   */
  onAcceptInvite(event: Event, inviteId: number): void {
    if (!this.info || !inviteId) {
      this.logger.warn("Cannot accept invite: missing project or inviteId");
      return;
    }

    this.stopEventPropagation(event);

    this.inviteService
      .acceptInvite(inviteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.onAcceptingInvite.emit(inviteId || this.info!.inviteId);
        },
        error: error => {
          this.logger.error("Error accepting invite:", error);
          this.inviteErrorModal = true;
        },
      });
  }

  /**
   * Подписка на проект или открытие модального окна отписки
   */
  onSubscribe(event: Event, projectId: number): void {
    if (!projectId) {
      this.logger.warn("Cannot subscribe: missing projectId");
      return;
    }

    this.stopEventPropagation(event);

    if (this.isSubscribed) {
      this.isUnsubscribeModalOpen = true;
      return;
    }

    this.subscriptionService
      .addSubscription(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubscribed = true;
        },
        error: error => {
          this.logger.error("Error subscribing to project:", error);
        },
      });
  }

  /**
   * Отписка от проекта
   */
  onUnsubscribe(event: Event, projectId: number): void {
    if (!projectId) {
      this.logger.warn("Cannot unsubscribe: missing projectId");
      return;
    }

    this.stopEventPropagation(event);

    this.subscriptionService
      .deleteSubscription(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubscribed = false;
          this.isUnsubscribeModalOpen = false;
        },
        error: error => {
          this.logger.error("Error unsubscribing from project:", error);
        },
      });
  }

  /**
   * Закрытие модального окна отписки
   */
  onCloseUnsubscribeModal(): void {
    this.isUnsubscribeModalOpen = false;
  }

  /**
   * Обработка создания нового проекта
   */
  onCreateProject(event: Event): void {
    this.stopEventPropagation(event);
    this.onCreate.emit();
  }

  /**
   * Остановка всплытия события
   */
  private stopEventPropagation(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
  }

  /**
   * Редирект на проеты при случае что подписки пустые
   */
  redirectToProjects(): void {
    this.router
      .navigateByUrl(`/office/projects/all`)
      .then(() => this.logger.debug("Route change from ProjectsComponent"));
  }

  /**
   * Вычисление флага haveBadge
   */
  private calculateHaveBadge(): boolean {
    return (
      location.href.includes("/subscriptions") ||
      location.href.includes("/all") ||
      location.href.includes("/projects")
    );
  }
}
