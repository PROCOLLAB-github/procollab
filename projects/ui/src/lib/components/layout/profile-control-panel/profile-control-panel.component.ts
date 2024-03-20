/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from "@angular/core";
import { InviteManageCardComponent, ProfileInfoComponent, IconComponent } from "@uilib";
import { ClickOutsideModule } from "ng-click-outside";
import { Invite } from "@office/models/invite.model";
import { RouterLink } from "@angular/router";
import { User } from "../../../models/user.model";

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
  @Input({ required: true }) user!: User | null;

  @Input({ required: true }) invites!: Invite[];

  @Input({ required: true }) hasNotifications = false;

  @Input({ required: true }) hasUnreads = false;

  @Output() acceptInvite = new EventEmitter<number>();

  @Output() rejectInvite = new EventEmitter<number>();

  @Output() logout = new EventEmitter();

  get hasInvites(): boolean {
    return !!this.invites.filter(invite => invite.isAccepted === null).length;
  }

  showNotifications = false;

  onClickOutside() {
    this.showNotifications = false;
  }
}
