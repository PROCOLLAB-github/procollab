/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { NotificationService } from "@services/notification.service";
import { AuthService } from "@auth/services";
import { Invite } from "@models/invite.model";
import { InviteService } from "@services/invite.service";
import { Router } from "@angular/router";
import { IconComponent } from "@ui/components";
import { AsyncPipe } from "@angular/common";
import { ClickOutsideModule } from "ng-click-outside";
import { InviteManageCardComponent, ProfileInfoComponent } from "@uilib";

/**
 * Компонент заголовка приложения
 *
 * Функциональность:
 * - Отображает верхнюю панель приложения с уведомлениями
 * - Управляет отображением панели уведомлений
 * - Показывает индикатор наличия уведомлений (красный шарик)
 * - Обрабатывает приглашения пользователя (принятие/отклонение)
 * - Отображает информацию о профиле пользователя
 * - Закрывает панель уведомлений при клике вне её области
 * - Перенаправляет на страницу проекта при принятии приглашения
 *
 * Входные параметры:
 * @Input invites - массив приглашений пользователя
 *
 * Внутренние свойства:
 * - showBall - индикатор наличия уведомлений (из NotificationService)
 * - showNotifications - флаг отображения панели уведомлений
 * - hasInvites - вычисляемое свойство наличия непрочитанных приглашений
 *
 * Сервисы:
 * - notificationService - управление уведомлениями
 * - authService - аутентификация и профиль пользователя
 * - inviteService - работа с приглашениями
 * - router - навигация по приложению
 */
@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
  standalone: true,
  imports: [
    ClickOutsideModule,
    IconComponent,
    InviteManageCardComponent,
    ProfileInfoComponent,
    AsyncPipe,
  ],
})
export class HeaderComponent implements OnInit {
  constructor(
    private readonly notificationService: NotificationService,
    public readonly authService: AuthService,
    private readonly inviteService: InviteService,
    private readonly router: Router
  ) {}

  @Input() invites: Invite[] = [];

  ngOnInit(): void {}

  showBall = this.notificationService.hasNotifications;
  showNotifications = false;

  /**
   * Проверка наличия непринятых приглашений
   * Возвращает true если есть приглашения со статусом null (не принято/не отклонено)
   */
  get hasInvites(): boolean {
    return !!this.invites.filter(invite => invite.isAccepted === null).length;
  }

  /**
   * Обработчик клика вне панели уведомлений
   * Закрывает панель уведомлений
   */
  onClickOutside() {
    this.showNotifications = false;
  }

  /**
   * Обработчик отклонения приглашения
   * Отправляет запрос на отклонение и удаляет приглашение из списка
   */
  onRejectInvite(inviteId: number): void {
    this.inviteService.rejectInvite(inviteId).subscribe(() => {
      const index = this.invites.findIndex(invite => invite.id === inviteId);
      this.invites.splice(index, 1);

      this.showNotifications = false;
    });
  }

  /**
   * Обработчик принятия приглашения
   * Отправляет запрос на принятие, удаляет приглашение из списка
   * и перенаправляет пользователя на страницу проекта
   */
  onAcceptInvite(inviteId: number): void {
    this.inviteService.acceptInvite(inviteId).subscribe(() => {
      const index = this.invites.findIndex(invite => invite.id === inviteId);
      const invite = JSON.parse(JSON.stringify(this.invites[index]));
      this.invites.splice(index, 1);

      this.showNotifications = false;
      this.router
        .navigateByUrl(`/office/projects/${invite.project.id}`)
        .then(() => console.debug("Route changed from HeaderComponent"));
    });
  }
}
