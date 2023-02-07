/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Invite } from "@models/invite.model";

@Component({
  selector: "app-invite-card",
  templateUrl: "./invite-card.component.html",
  styleUrls: ["./invite-card.component.scss"],
})
export class InviteCardComponent implements OnInit {
  constructor() {}

  @Input() invite?: Invite;
  @Output() remove = new EventEmitter<number>();

  ngOnInit(): void {}

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.remove.emit(this.invite?.id);
  }
}
