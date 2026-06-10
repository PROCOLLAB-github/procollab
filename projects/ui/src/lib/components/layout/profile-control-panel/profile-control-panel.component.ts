/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  input,
  output,
} from "@angular/core";
import { InviteManageCardComponent } from "../invite-manage-card/invite-manage-card.component";
import { ProfileInfoComponent } from "../profile-info/profile-info.component";
import { IconComponent } from "../../primitives/icon/icon.component";
import { ClickOutsideModule } from "ng-click-outside";
import type { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { RouterLink } from "@angular/router";
import { EmptyManageCardComponent } from "../empty-manage-card/empty-manage-card.component";
import { User } from "@domain/auth/user.model";

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
  imports: [
    CommonModule,
    InviteManageCardComponent,
    ProfileInfoComponent,
    ClickOutsideModule,
    IconComponent,
    EmptyManageCardComponent,
  ],
  templateUrl: "./profile-control-panel.component.html",
  styleUrl: "./profile-control-panel.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileControlPanelComponent {
  /** Данные текущего пользователя */
  readonly user = input.required<User | null>();

  /** Массив приглашений пользователя */
  readonly invites = input.required<Invite[]>();

  /** Флаг наличия уведомлений */
  readonly hasNotifications = input<boolean>(false);

  /** Флаг наличия непрочитанных сообщений */
  readonly hasUnreads = input<boolean>(false);

  /** Событие принятия приглашения (передает ID приглашения) */
  readonly acceptInvite = output<number>();

  /** Событие отклонения приглашения (передает ID приглашения) */
  readonly rejectInvite = output<number>();

  /** Событие выхода из системы */
  readonly logout = output();

  /**
   * Проверяет наличие неотвеченных приглашений
   * @returns true если есть приглашения без ответа
   */
  get hasInvites(): boolean {
    return !!this.invites().filter(invite => invite.isAccepted === null).length;
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
