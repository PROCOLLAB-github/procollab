/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AuthService } from "@auth/services";
import { NotificationService } from "@services/notification.service";
import { InviteService } from "@services/invite.service";
import { Invite } from "@models/invite.model";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { ProfileInfoComponent } from "@ui/components/profile-info/profile-info.component";
import { InviteManageCardComponent } from "../invite-manage-card/invite-manage-card.component";
import { AsyncPipe } from "@angular/common";
import { ProfileControlPanelComponent, IconComponent } from "@uilib";
import { ClickOutsideModule } from "ng-click-outside";

@Component({
  selector: "ui-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.scss",
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    IconComponent,
    ClickOutsideModule,
    InviteManageCardComponent,
    ProfileControlPanelComponent,
    ProfileInfoComponent,
    AsyncPipe,
  ],
})
export class SidebarComponent implements OnInit {
  constructor(
    public readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly inviteService: InviteService,
    private readonly router: Router
  ) {}

  @Input({ required: true }) invites: Invite[] = [];
  @Input() hasUnreads = false;

  @Output() logout = new EventEmitter<void>();

  ngOnInit(): void {}

  showNotifications = false;

  barPosition = 0;
  showBar = true;

  get hasInvites(): boolean {
    return !!this.invites.filter(invite => invite.isAccepted === null).length;
  }

  hasNotifications = this.notificationService.hasNotifications;

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
        .then(() => console.debug("Route changed from SidebarComponent"));
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.router
        .navigateByUrl("/auth")
        .then(() => console.debug("Route changed from SidebarComponent"));
    });
  }
}
