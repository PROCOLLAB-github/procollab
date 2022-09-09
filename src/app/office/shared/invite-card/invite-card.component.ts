/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { User } from "../../../auth/models/user.model";

@Component({
  selector: "app-invite-card",
  templateUrl: "./invite-card.component.html",
  styleUrls: ["./invite-card.component.scss"],
})
export class InviteCardComponent implements OnInit {
  constructor() {}

  @Input() user?: User;
  @Output() remove = new EventEmitter<number>();

  ngOnInit(): void {}

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.remove.emit(this.user?.id);
  }
}
