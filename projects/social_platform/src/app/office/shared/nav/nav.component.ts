/** @format */

import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, signal } from "@angular/core";
import { NavService } from "@services/nav.service";
import { NavigationStart, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { noop, Subscription } from "rxjs";
import { NotificationService } from "@services/notification.service";
import { Invite } from "@models/invite.model";
import { AuthService } from "@auth/services";
import { InviteService } from "@services/invite.service";
import { AsyncPipe } from "@angular/common";
import { IconComponent } from "@ui/components";
import {
  InviteManageCardComponent,
  ProfileInfoComponent,
  SubscriptionPlansComponent,
} from "@uilib";
import { SubscriptionPlan, SubscriptionPlansService } from "@corelib";

@Component({
  selector: "app-nav",
  templateUrl: "./nav.component.html",
  styleUrl: "./nav.component.scss",
  standalone: true,
  imports: [
    IconComponent,
    RouterLink,
    RouterLinkActive,
    InviteManageCardComponent,
    ProfileInfoComponent,
    SubscriptionPlansComponent,
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
    private readonly cdref: ChangeDetectorRef,
    private readonly subscriptionPlansService: SubscriptionPlansService
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

    const subscriptionsSub$ = this.subscriptionPlansService
      .getSubscriptions()
      .subscribe(subscriptions => {
        this.subscriptions.set(subscriptions);
      });
    this.subscriptions$.push(subscriptionsSub$);
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

  openSubscription = signal(false);
  subscriptions = signal<SubscriptionPlan[]>([]);
  openSkills() {
    this.authService.isSubscribed().subscribe(subscribed => {
      if (subscribed) {
        location.href = "https://skills.procollab.ru";
        return;
      }

      this.openSubscription.set(true);
    });
  }

  protected readonly noop = noop;
}
