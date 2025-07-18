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

  @Input() progress?: number;

  @Input() onlineBadgeSize = 16;
  @Input() onlineBadgeBorder = 3;
  @Input() onlineBadgeOffset = 0;

  placeholderUrl = "https://hwchamber.co.uk/wp-content/uploads/2022/04/avatar-placeholder.gif";

  constructor() {}

  ngOnInit(): void {}
}
