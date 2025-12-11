/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from "@angular/core";
import { InviteManageCardComponent, ProfileInfoComponent, IconComponent } from "@uilib";
import { ClickOutsideModule } from "ng-click-outside";
import type { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { RouterLink } from "@angular/router";
import type { User } from "../../../models/user.model";

/**
 * Компонент панели управления профилем
 *
 * Отображает кнопки для уведомлений, чатов и выхода из системы.
 * Включает выпадающую панель с уведомлениями и приглашениями.
 * Показывает информацию о текущем пользователе.
 *
 * @example
 * \`\`\`html
 * <app-profile-control-panel
 *   [user]="currentUser"
 *   [invites]="userInvites"
 *   [hasNotifications]="true"
 *   [hasUnreads]="false"
 *   (acceptInvite)="onAcceptInvite($event)"
 *   (rejectInvite)="onRejectInvite($event)"
 *   (logout)="onLogout()">
 * </app-profile-control-panel>
 * \`\`\`
 */
@Component({
  selector: "app-profile-control-panel",
  standalone: true,
  imports: [
    CommonModule,
    InviteManageCardComponent,
    ProfileInfoComponent,
    ClickOutsideModule,
    IconComponent,
    RouterLink,
  ],
  templateUrl: "./profile-control-panel.component.html",
  styleUrl: "./profile-control-panel.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileControlPanelComponent {
  /** Данные текущего пользователя */
  @Input({ required: true }) user!: User | null;

  /** Массив приглашений пользователя */
  @Input({ required: true }) invites!: Invite[];

  /** Флаг наличия уведомлений */
  @Input({ required: true }) hasNotifications = false;

  /** Флаг наличия непрочитанных сообщений */
  @Input({ required: true }) hasUnreads = false;

  /** Событие принятия приглашения (передает ID приглашения) */
  @Output() acceptInvite = new EventEmitter<number>();

  /** Событие отклонения приглашения (передает ID приглашения) */
  @Output() rejectInvite = new EventEmitter<number>();

  /** Событие выхода из системы */
  @Output() logout = new EventEmitter();

  /**
   * Проверяет наличие неотвеченных приглашений
   * @returns true если есть приглашения без ответа
   */
  get hasInvites(): boolean {
    return !!this.invites.filter(invite => invite.isAccepted === null).length;
  }

  /** Флаг отображения панели уведомлений */
  showNotifications = false;

  /**
   * Обработчик клика вне панели уведомлений
   * Скрывает панель уведомлений
   */
  onClickOutside() {
    this.showNotifications = false;
  }
}
