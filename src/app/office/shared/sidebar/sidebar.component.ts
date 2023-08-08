/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { AuthService } from "@auth/services";
import { NotificationService } from "@services/notification.service";
import { InviteService } from "@services/invite.service";
import { Invite } from "@models/invite.model";
import { Router } from "@angular/router";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  constructor(
    public readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly inviteService: InviteService,
    private readonly router: Router
  ) {}

  @Input() invites: Invite[] = [];

  ngOnInit(): void {}

  showBall = this.notificationService.hasNotifications;

  showNotifications = false;

  barPosition = 0;
  showBar = true;

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
