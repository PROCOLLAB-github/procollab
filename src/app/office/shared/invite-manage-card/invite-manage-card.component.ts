/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Invite } from "@models/invite.model";

@Component({
  selector: "app-invite-manage-card",
  templateUrl: "./invite-manage-card.component.html",
  styleUrls: ["./invite-manage-card.component.scss"],
})
export class InviteManageCardComponent implements OnInit {
  constructor() {}

  @Input() invite?: Invite;
  @Output() accept = new EventEmitter<number>();
  @Output() reject = new EventEmitter<number>();

  ngOnInit(): void {}
}
