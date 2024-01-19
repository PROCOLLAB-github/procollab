/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Invite } from "@models/invite.model";
import { DayjsPipe } from "@core/pipes/dayjs.pipe";
import { ButtonComponent } from "@ui/components";
import { RouterLink } from "@angular/router";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";

@Component({
  selector: "app-invite-manage-card",
  templateUrl: "./invite-manage-card.component.html",
  styleUrl: "./invite-manage-card.component.scss",
  standalone: true,
  imports: [AvatarComponent, RouterLink, ButtonComponent, DayjsPipe],
})
export class InviteManageCardComponent implements OnInit {
  constructor() {}

  @Input({ required: true }) invite!: Invite;
  @Output() accept = new EventEmitter<number>();
  @Output() reject = new EventEmitter<number>();

  ngOnInit(): void {}
}
