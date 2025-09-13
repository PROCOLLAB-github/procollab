/** @format */

import { Component, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { Project } from "@models/project.model";
import { IndustryService } from "@services/industry.service";
import { IconComponent, ButtonComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { AsyncPipe, CommonModule } from "@angular/common";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { SubscriptionService } from "@office/services/subscription.service";
import { InviteService } from "@office/services/invite.service";
import { Router } from "@angular/router";
import { ClickOutsideModule } from "ng-click-outside";

/**
 * Компонент карточки проекта
 *
 * Функциональность:
 * - Отображает основную информацию о проекте (название, описание, участники)
 * - Показывает аватары участников проекта
 * - Отображает информацию об отрасли проекта через IndustryService
 * - Предоставляет кнопку удаления проекта (корзина) при наличии прав
 * - Поддерживает индикацию подписки на проект
 * - Проверяет права доступа на основе ID профиля пользователя
 *
 * Входные параметры:
 * @Input project - объект проекта (обязательный)
 * @Input canDelete - флаг возможности удаления проекта (по умолчанию false)
 * @Input isSubscribed - флаг подписки на проект (по умолчанию false)
 * @Input profileId - ID профиля текущего пользователя
 *
 * Выходные события:
 * @Output remove - событие удаления проекта, передает ID проекта
 *
 * Внутренние свойства:
 * - industryService - сервис для работы с отраслями (публичный для использования в шаблоне)
 */
@Component({
  selector: "app-project-card",
  templateUrl: "./project-card.component.html",
  styleUrl: "./project-card.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    AvatarComponent,
    IconComponent,
    AsyncPipe,
    ModalComponent,
    ButtonComponent,
    ClickOutsideModule,
  ],
})
export class ProjectCardComponent implements OnInit {
  private readonly inviteService = inject(InviteService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly router = inject(Router);
  public readonly industryService = inject(IndustryService);

  @Input({ required: true }) project!: Project;
  @Input() type: "invite" | "project" = "project";
  @Input() canDelete?: boolean | null = false;
  @Input() isSubscribed?: boolean | null = false;
  @Input() profileId?: number;

  @Output() onAcceptingInvite = new EventEmitter<number>();
  @Output() onRejectingInvite = new EventEmitter<number>();

  ngOnInit(): void {}

  onRejectInvite(event: Event, inviteId: number): void {
    event.stopPropagation();
    event.preventDefault();

    this.inviteService.rejectInvite(inviteId).subscribe({
      next: () => {
        this.onRejectingInvite.emit(inviteId || this.project.inviteId);
      },
      error: () => {
        this.inviteErrorModal = true;
      },
    });
  }

  onAcceptInvite(event: Event, inviteId: number): void {
    event.stopPropagation();
    event.preventDefault();

    this.inviteService.acceptInvite(inviteId).subscribe({
      next: () => {
        this.onAcceptingInvite.emit(inviteId || this.project.inviteId);
      },
      error: () => {
        this.inviteErrorModal = true;
      },
    });
  }

  isUnsubscribeModalOpen = false; // Флаг модального окна отписки
  inviteErrorModal = false; // Флаг модального окна для ошибки приглашения
  haveBadge = location.href.includes("/subscriptions") || location.href.includes("/all");

  /**
   * Подписка на проект или открытие модального окна отписки
   * @param projectId - ID проекта
   */
  onSubscribe(event: Event, projectId: number): void {
    event.stopPropagation();
    event.preventDefault();

    if (this.isSubscribed) {
      this.isUnsubscribeModalOpen = true;
      return;
    }
    this.subscriptionService.addSubscription(projectId).subscribe(() => {
      this.isSubscribed = true;
    });
  }

  /**
   * Отписка от проекта
   * @param projectId - ID проекта
   */
  onUnsubscribe(event: Event, projectId: number): void {
    event.stopPropagation();
    event.preventDefault();

    this.subscriptionService.deleteSubscription(projectId).subscribe(() => {
      this.isSubscribed = false;
      this.isUnsubscribeModalOpen = false;
    });
  }

  /**
   * Закрытие модального окна отписки
   */
  onCloseUnsubscribeModal(): void {
    this.isUnsubscribeModalOpen = false;
  }
}
