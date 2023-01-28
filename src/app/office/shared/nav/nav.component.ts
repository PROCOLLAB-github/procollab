/** @format */

import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "../../services/nav.service";
import { NavigationStart, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { NotificationService } from "../../services/notification.service";
import { Invite } from "../../models/invite.model";
import { AuthService } from "../../../auth/services";
import { InviteService } from "../../services/invite.service";

@Component({
  selector: "app-nav",
  templateUrl: "./nav.component.html",
  styleUrls: ["./nav.component.scss"],
})
export class NavComponent implements OnInit, OnDestroy {
  constructor(
    public readonly navService: NavService,
    private readonly router: Router,
    public readonly notificationService: NotificationService,
    private readonly inviteService: InviteService,
    public readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.routerEvents$ = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.mobileMenuOpen = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.routerEvents$?.unsubscribe();
  }

  @Input() invites: Invite[] = [];

  routerEvents$?: Subscription;

  mobileMenuOpen = false;

  notificationsOpen = false;

  get hasInvites(): boolean {
    return !!this.invites.filter(invite => invite.isAccepted === null).length;
  }

  onRejectInvite(inviteId: number): void {
    this.inviteService.rejectInvite(inviteId).subscribe(() => {
      const index = this.invites.findIndex(invite => invite.id === inviteId);
      this.invites.splice(index, 1);

      this.notificationsOpen = false;
      this.mobileMenuOpen = false;
    });
  }

  onAcceptInvite(inviteId: number): void {
    this.inviteService.acceptInvite(inviteId).subscribe(() => {
      const index = this.invites.findIndex(invite => invite.id === inviteId);
      const invite = JSON.parse(JSON.stringify(this.invites[index]));
      this.invites.splice(index, 1);

      this.notificationsOpen = false;
      this.mobileMenuOpen = false;

      this.router
        .navigateByUrl(`/office/projects/${invite.project.id}`)
        .then(() => console.debug("Route changed from HeaderComponent"));
    });
  }
}
