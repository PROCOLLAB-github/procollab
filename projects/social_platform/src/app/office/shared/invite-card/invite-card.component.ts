/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Invite } from "@models/invite.model";
import { IconComponent } from "@ui/components";

@Component({
  selector: "app-invite-card",
  templateUrl: "./invite-card.component.html",
  styleUrl: "./invite-card.component.scss",
  standalone: true,
  imports: [IconComponent],
})
export class InviteCardComponent implements OnInit {
  constructor() {}

  @Input({ required: true }) invite!: Invite;
  @Output() remove = new EventEmitter<number>();

  ngOnInit(): void {}

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.remove.emit(this.invite?.id);
  }
}
