/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { NotificationService } from "@services/notification.service";
import { AuthService } from "@auth/services";
import { Invite } from "@models/invite.model";
import { InviteService } from "@services/invite.service";
import { Router } from "@angular/router";
import { ProfileInfoComponent } from "@ui/components/profile-info/profile-info.component";
import { InviteManageCardComponent } from "../invite-manage-card/invite-manage-card.component";
import { IconComponent } from "@ui/components";
import { AsyncPipe } from "@angular/common";
import { ClickOutsideModule } from "ng-click-outside";

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
    private readonly router: Router,
  ) {}

  @Input() invites: Invite[] = [];

  ngOnInit(): void {}

  showBall = this.notificationService.hasNotifications;

  showNotifications = false;
  get hasInvites(): boolean {
    return !!this.invites.filter(invite => invite.isAccepted === null).length;
  }

  onClickOutside() {
    this.showNotifications = false;
  }

  onRejectInvite(inviteId: number): void {
    this.inviteService.rejectInvite(inviteId).subscribe(() => {
      const index = this.invites.findIndex(invite => invite.id === inviteId);
      this.invites.splice(index, 1);

      this.showNotifications = false;
    });
  }

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
