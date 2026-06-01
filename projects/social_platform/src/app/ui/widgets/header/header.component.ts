/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  input,
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

/** Компонент заголовка приложения с панелью уведомлений и инвайтами. */
@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
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

  readonly invites = input<Invite[]>([]);

  @Output() acceptInvite = new EventEmitter<number>();
  @Output() rejectInvite = new EventEmitter<number>();

  showBall = this.notificationService.hasNotifications;
  showNotifications = false;

  get hasInvites(): boolean {
    return !!this.invites().filter(invite => invite.isAccepted === null).length;
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
