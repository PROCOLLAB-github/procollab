/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from "@angular/core";
import { Invite } from "@domain/invite/invite.model";
import { IconComponent } from "@ui/primitives";
import { AsyncPipe } from "@angular/common";
import { ClickOutsideModule } from "ng-click-outside";
import { InviteManageCardComponent, ProfileInfoComponent } from "@uilib";
import { NotificationService } from "@ui/services/notification/notification.service";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";

/**
 * Компонент заголовка приложения
 *
 * Функциональность:
 * - Отображает верхнюю панель приложения с уведомлениями
 * - Управляет отображением панели уведомлений
 * - Показывает индикатор наличия уведомлений (красный шарик)
 * - Отображает информацию о профиле пользователя
 * - Закрывает панель уведомлений при клике вне её области
 * - Пробрасывает события принятия/отклонения приглашений в родительский компонент
 *
 * Входные параметры:
 * @Input invites - массив приглашений пользователя
 *
 * Исходящие события:
 * @Output acceptInvite - id приглашения, которое нужно принять
 * @Output rejectInvite - id приглашения, которое нужно отклонить
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly notificationService = inject(NotificationService);
  public readonly authService = inject(AuthInfoService);

  @Input() invites: Invite[] = [];

  @Output() acceptInvite = new EventEmitter<number>();
  @Output() rejectInvite = new EventEmitter<number>();

  showBall = this.notificationService.hasNotifications;
  showNotifications = false;

  get hasInvites(): boolean {
    return !!this.invites.filter(invite => invite.isAccepted === null).length;
  }

  onClickOutside() {
    this.showNotifications = false;
  }

  onRejectInvite(inviteId: number): void {
    this.rejectInvite.emit(inviteId);
    this.showNotifications = false;
  }

  onAcceptInvite(inviteId: number): void {
    this.acceptInvite.emit(inviteId);
    this.showNotifications = false;
  }
}
