/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Invite } from "@models/invite.model";
import { IconComponent } from "../../../ui/components/icon/icon.component";
import { NgIf } from "@angular/common";

@Component({
    selector: "app-invite-card",
    templateUrl: "./invite-card.component.html",
    styleUrl: "./invite-card.component.scss",
    standalone: true,
    imports: [NgIf, IconComponent],
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
