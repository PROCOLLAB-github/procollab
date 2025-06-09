/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import {
  IconComponent,
  InviteManageCardComponent,
  ProfileControlPanelComponent,
  ProfileInfoComponent,
} from "@uilib";
import { AsyncPipe } from "@angular/common";
import { ClickOutsideModule } from "ng-click-outside";

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
  @Input() navItems: NavItem[] = [];
  @Input({ required: true }) logoSrc!: string;

  ngOnInit(): void {}

  barPosition = 0;
  showBar = true;

  redirectToHome(): void {
    window.location.href = "https://app.procollab.ru/office/feed";
  }
}
