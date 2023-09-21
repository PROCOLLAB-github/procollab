/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { ChatListItem } from "@office/chat/models/chat-item.model";

@Component({
  selector: "app-chat-card",
  templateUrl: "./chat-card.component.html",
  styleUrls: ["./chat-card.component.scss"],
})
export class ChatCardComponent implements OnInit {
  constructor() {}

  @Input() chat!: ChatListItem;
  @Input() isLast = false;

  ngOnInit(): void {}
}
