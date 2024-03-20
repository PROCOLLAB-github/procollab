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

  @Input() invites: Invite[] = [];
  @Input() hasUnreads = false;
  @Input() hasNotifications?: BehaviorSubject<boolean>;

  @Input({ required: true }) logoSrc!: string;

  @Output() logout = new EventEmitter<void>();
  @Output() acceptInvite = new EventEmitter<number>();
  @Output() rejectInvite = new EventEmitter<number>();

  ngOnInit(): void {}

  showNotifications = false;

  barPosition = 0;
  showBar = true;
  onClickOutside() {
    this.showNotifications = false;
  }
}
