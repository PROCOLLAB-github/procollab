/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Input,
  input,
  output,
} from "@angular/core";
import { IconComponent, ButtonComponent } from "@ui/primitives";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { CommonModule } from "@angular/common";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ClickOutsideModule } from "ng-click-outside";
import { Router, RouterLink } from "@angular/router";
import { TagComponent } from "@ui/primitives/tag/tag.component";
import { YearsFromBirthdayPipe, TruncatePipe } from "@corelib";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AddProjectSubscriptionUseCase } from "@api/project/use-cases/add-project-subscription.use-case";
import { DeleteProjectSubscriptionUseCase } from "@api/project/use-cases/delete-project-subscription.use-case";
import { AppRoutes } from "@api/paths/app-routes";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { Project } from "@domain/project/project.model";

interface MyProjectPresentation {
  lifecycle: "submitted" | "draft" | "program" | "published";
  statusLabel: string;
  role: "leader" | "participant";
  roleLabel: "Лидер" | "Участник";
  accessLabel: "можно редактировать" | "только просмотр";
  canEdit: boolean;
  actionLabel: "Открыть";
  actionRoute: string;
}

/**
 * Компонент карточки информации с разным наполнением, в зависимости от контекста
 */
@Component({
  selector: "app-info-card",
  templateUrl: "./info-card.component.html",
  styleUrl: "./info-card.component.scss",
  imports: [
    CommonModule,
    AvatarComponent,
    IconComponent,
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
  private readonly addProjectSubscriptionUseCase = inject(AddProjectSubscriptionUseCase);
  private readonly deleteProjectSubscriptionUseCase = inject(DeleteProjectSubscriptionUseCase);
  public readonly industryRepository = inject(IndustryRepositoryPort);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);

  protected readonly AppRoutes = AppRoutes;

  readonly info = input<any>();
  readonly type = input<"invite" | "projects" | "members" | "rating">("projects");
  readonly appereance = input<"my" | "subs" | "base" | "empty">("base");
  readonly section = input<"projects" | "subscriptions" | "other">("projects");
  readonly canDelete = input<boolean | null>(false);
  @Input() isSubscribed?: boolean | null = false;
  readonly profileId = input<number>();
  readonly leaderId = input<number>();
  readonly loggedUserId = input<number>();
  readonly showSubscriptionAction = input(false);

  /** Общая геометрия применяется только к заполненным карточкам проектов. */
  protected readonly isProjectCard = computed(
    () => this.type() === "projects" && this.appereance() !== "empty",
  );

  /** Отрасль берётся из уже загруженного справочника; пустая плашка не занимает строку. */
  protected readonly projectIndustry = computed(() => {
    if (!this.isProjectCard() || this.appereance() === "my") return null;
    const industryId = this.info()?.industry;
    return industryId == null
      ? null
      : this.industryRepository.getOne(industryId)?.name?.trim() || null;
  });

  /**
   * Разделяет lifecycle и доступ пользователя в представлении «Моего проекта».
   * Сдача важнее draft и отображается как «только просмотр», включая лидера. Пока профиль
   * не загружен, совпадение отсутствующих ID не даёт редактирование. Это только
   * отображение готовых данных: действующие guard и серверные права не меняются.
   */
  protected readonly myProjectPresentation = computed<MyProjectPresentation | null>(() => {
    if (this.type() !== "projects" || this.appereance() !== "my") return null;
    const project: Project | undefined = this.info();
    if (!project) return null;

    const lifecycle =
      project.partnerProgram?.isSubmitted === true
        ? "submitted"
        : project.draft === true
          ? "draft"
          : project.partnerProgram != null
            ? "program"
            : "published";
    const labels = {
      submitted: "Сдан в программу",
      draft: "Черновик",
      program: "В программе",
      published: "Опубликован",
    };
    const userId = this.loggedUserId();
    const isLeader = userId != null && project.leader === userId;
    const canEdit = isLeader && lifecycle !== "submitted";
    return {
      lifecycle,
      statusLabel: labels[lifecycle],
      role: isLeader ? "leader" : "participant",
      roleLabel: isLeader ? "Лидер" : "Участник",
      accessLabel: canEdit ? "можно редактировать" : "только просмотр",
      canEdit,
      actionLabel: "Открыть",
      actionRoute: AppRoutes.projects.detail(project.id),
    };
  });

  readonly onAcceptingInvite = output<number>();
  readonly onRejectingInvite = output<number>();
  readonly onCreate = output();
  readonly onRemoveCollaborator = output<number>();

  // Состояние компонента
  isUnsubscribeModalOpen = false;
  inviteErrorModal = false;

  removeCollaboratorFromProject(userId: number): void {
    this.onRemoveCollaborator.emit(userId);
  }

  /**
   * Контейнер явно разрешает действие подписки; URL не определяет контекст карточки.
   * Приглашения, участники, пустые и собственные проекты не получают это действие.
   */
  shouldShowSubscriptionBadge(): boolean {
    return (
      this.showSubscriptionAction() &&
      this.isProjectCard() &&
      (this.appereance() === "base" || this.appereance() === "subs")
    );
  }

  /**
   * Возвращает URL для аватара
   */
  getAvatarUrl(): string {
    const currentImageAddress =
      this.appereance() === "empty" && this.section() === "projects"
        ? "/assets/images/projects/shared/add-project.svg"
        : this.appereance() === "empty" && this.section() === "subscriptions"
          ? "/assets/images/projects/shared/empty-subscriptions.svg"
          : "";
    return this.info()?.imageAddress || this.info()?.avatar || currentImageAddress;
  }

  /**
   * Переключение подписки (универсальный метод)
   */
  toggleSubscription(event: Event): void {
    if (this.isSubscribed) {
      this.onSubscribe(event, this.profileId()!);
    } else {
      this.onSubscribe(event, this.profileId()!);
    }
  }

  /**
   * Обработка отклонения приглашения
   */
  onRejectInvite(event: Event, inviteId: number): void {
    if (!this.info() || !inviteId) {
      this.logger.warn("Cannot reject invite: missing project or inviteId");
      return;
    }

    this.stopEventPropagation(event);
    this.onRejectingInvite.emit(inviteId);
  }

  /**
   * Обработка принятия приглашения
   */
  onAcceptInvite(event: Event, inviteId: number): void {
    if (!this.info() || !inviteId) {
      this.logger.warn("Cannot accept invite: missing project or inviteId");
      return;
    }

    this.stopEventPropagation(event);
    this.onAcceptingInvite.emit(inviteId);
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

    this.addProjectSubscriptionUseCase
      .execute(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.logger.error("Error subscribing to project:", result.error);
            return;
          }

          this.isSubscribed = true;
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

    this.deleteProjectSubscriptionUseCase
      .execute(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.logger.error("Error unsubscribing from project:", result.error);
            return;
          }

          this.isSubscribed = false;
          this.isUnsubscribeModalOpen = false;
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
      .navigateByUrl(AppRoutes.projects.all())
      .then(() => this.logger.debug("Route change from ProjectsComponent"));
  }
}
