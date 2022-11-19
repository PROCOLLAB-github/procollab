/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { NotificationService } from "../../services/notification.service";
import { AuthService } from "../../../auth/services";
import { map } from "rxjs";
import { Invite } from "../../models/invite.model";
import { InviteService } from "../../services/invite.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
  constructor(
    private notificationService: NotificationService,
    public authService: AuthService,
    private inviteService: InviteService,
    private router: Router
  ) {
  }

  showBall = this.notificationService.hasNotifications.pipe(map(has => has || this.invites.length));
  showNotifications = false;

  @Input() invites: Invite[] = [];

  ngOnInit(): void {
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
