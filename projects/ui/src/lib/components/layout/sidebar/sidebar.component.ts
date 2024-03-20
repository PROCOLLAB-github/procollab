/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Invite } from "@models/invite.model";
import { RouterLink, RouterLinkActive } from "@angular/router";
import {
  IconComponent,
  InviteManageCardComponent,
  ProfileControlPanelComponent,
  ProfileInfoComponent,
} from "@uilib";
import { AsyncPipe } from "@angular/common";
import { ClickOutsideModule } from "ng-click-outside";
import { BehaviorSubject } from "rxjs";
import { User } from "../../../models/user.model";

export interface NavItem {
  link: string;
  icon: string;
  name: string;
}

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
  @Input() user?: User;

  @Input() invites?: Invite[] = [];
  @Input() hasUnreads?: boolean = false;
  @Input() hasNotifications?: BehaviorSubject<boolean>;

  @Input() navItems: NavItem[] = [];
  @Input({ required: true }) logoSrc!: string;

  @Output() logout = new EventEmitter<void>();
  @Output() acceptInvite = new EventEmitter<number>();
  @Output() rejectInvite = new EventEmitter<number>();

  ngOnInit(): void {}

  barPosition = 0;
  showBar = true;
}
