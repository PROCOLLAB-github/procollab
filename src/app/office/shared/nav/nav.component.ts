/** @format */

import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "@services/nav.service";
import { NavigationStart, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { Subscription } from "rxjs";
import { NotificationService } from "@services/notification.service";
import { Invite } from "@models/invite.model";
import { AuthService } from "@auth/services";
import { InviteService } from "@services/invite.service";
import { ProfileInfoComponent } from "../../../ui/components/profile-info/profile-info.component";
import { InviteManageCardComponent } from "../invite-manage-card/invite-manage-card.component";
import { NgIf, NgFor, AsyncPipe } from "@angular/common";
import { IconComponent } from "../../../ui/components/icon/icon.component";

@Component({
    selector: "app-nav",
    templateUrl: "./nav.component.html",
    styleUrl: "./nav.component.scss",
    standalone: true,
    imports: [
        IconComponent,
        NgIf,
        RouterLink,
        RouterLinkActive,
        NgFor,
        InviteManageCardComponent,
        ProfileInfoComponent,
        AsyncPipe,
    ],
})
export class NavComponent implements OnInit, OnDestroy {
  constructor(
    public readonly navService: NavService,
    private readonly router: Router,
    public readonly notificationService: NotificationService,
    private readonly inviteService: InviteService,
    public readonly authService: AuthService,
    private readonly cdref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const routerEvents$ = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.mobileMenuOpen = false;
      }
    });
    routerEvents$ && this.subscriptions$.push(routerEvents$);

    const title$ = this.navService.navTitle.subscribe(title => {
      this.title = title;
      this.cdref.detectChanges();
    });

    title$ && this.subscriptions$.push(title$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  @Input() invites: Invite[] = [];

  subscriptions$: Subscription[] = [];

  mobileMenuOpen = false;

  notificationsOpen = false;

  title = "";

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
