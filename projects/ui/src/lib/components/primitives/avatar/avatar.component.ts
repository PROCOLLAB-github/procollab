/** @format */

import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-avatar",
  templateUrl: "./avatar.component.html",
  styleUrl: "./avatar.component.scss",
  standalone: true,
})
export class AvatarComponent implements OnInit {
  @Input({ required: true }) url?: string;
  @Input() size = 50;
  @Input() hasBorder = false;
  @Input() isOnline = false;

  @Input() onlineBadgeSize = 16;
  @Input() onlineBadgeBorder = 3;
  @Input() onlineBadgeOffset = 0;

  placeholderUrl =
    "https://uch-ibadan.org.ng/wp-content/uploads/2021/10/Profile_avatar_placeholder_large.png";

  constructor() {}

  ngOnInit(): void {}
}
