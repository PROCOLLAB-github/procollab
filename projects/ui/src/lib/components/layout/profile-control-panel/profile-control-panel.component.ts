/** @format */

import { ChangeDetectionStrategy, Component, HostListener, input, output } from "@angular/core";
import { ProfileInfoComponent } from "../profile-info/profile-info.component";
import { IconComponent } from "../../primitives/icon/icon.component";
import { ClickOutsideModule } from "ng-click-outside";
import { User } from "@domain/auth/user.model";
import { normalizeNotificationActionUrl } from "@domain/notification/notification-action-url";
import { Notification, NotificationType } from "@domain/notification/notification.model";
import { NotificationRelativeTimePipe } from "./notification-relative-time.pipe";

/**
 * Компонент панели управления профилем
 *
 * Отображает кнопки для уведомлений и выхода из системы.
 * Включает доступный выпадающий центр backend-уведомлений.
 * Показывает информацию о текущем пользователе.
 *
 * @example
 * \`\`\`html
 * <app-profile-control-panel
 *   [user]="currentUser"
 *   [notifications]="notifications"
 *   [unreadCount]="3"
 *   (logout)="onLogout()">
 * </app-profile-control-panel>
 * \`\`\`
 */
@Component({
  selector: "app-profile-control-panel",
  imports: [ProfileInfoComponent, ClickOutsideModule, IconComponent, NotificationRelativeTimePipe],
  templateUrl: "./profile-control-panel.component.html",
  styleUrl: "./profile-control-panel.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileControlPanelComponent {
  /** Данные текущего пользователя */
  readonly user = input.required<User | null>();

  readonly notifications = input<Notification[]>([]);
  readonly unreadCount = input(0);
  readonly loading = input(false);
  readonly loadingMore = input(false);
  readonly markingAllRead = input(false);
  readonly hasMore = input(false);
  readonly error = input<string | null>(null);

  /** Флаг наличия непрочитанных сообщений */
  readonly hasUnreads = input<boolean>(false);

  readonly notificationClick = output<Notification>();
  readonly markAllRead = output<void>();
  readonly loadMore = output<void>();
  readonly retry = output<void>();
  readonly openChange = output<boolean>();

  /** Событие выхода из системы */
  readonly logout = output<void>();

  /** Флаг отображения панели уведомлений */
  showNotifications = false;

  toggleNotifications(): void {
    this.setNotificationsOpen(!this.showNotifications);
  }

  onClickOutside(): void {
    this.setNotificationsOpen(false);
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    this.setNotificationsOpen(false);
  }

  selectNotification(notification: Notification): void {
    if (normalizeNotificationActionUrl(notification)) this.setNotificationsOpen(false);
    this.notificationClick.emit(notification);
  }

  hasSafeAction(notification: Notification): boolean {
    return normalizeNotificationActionUrl(notification) !== null;
  }

  notificationIcon(type: NotificationType): string {
    if (type.startsWith("project_invite_")) return "projects";
    if (type.startsWith("vacancy_response_")) return "suitcase";
    if (type === "program_news_published") return "feed";
    if (type === "program_material_published") return "file";
    if (type === "course_access_opened") return "academic-hat";
    return "bell";
  }

  onAvatarError(event: Event): void {
    if (event.currentTarget instanceof HTMLImageElement) event.currentTarget.hidden = true;
  }

  private setNotificationsOpen(open: boolean): void {
    if (this.showNotifications === open) return;
    this.showNotifications = open;
    this.openChange.emit(open);
  }
}
