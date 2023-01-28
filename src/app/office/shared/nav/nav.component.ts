/** @format */

import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "../../services/nav.service";
import { NavigationStart, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { NotificationService } from "../../services/notification.service";
import { Invite } from "../../models/invite.model";
import { AuthService } from "../../../auth/services";

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

  get hasInvites(): boolean {
    return !!this.invites.filter(invite => invite.isAccepted === null).length;
  }
}
