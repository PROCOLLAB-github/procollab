/** @format */

import { Component, OnInit } from "@angular/core";
import { ChatMessage } from "@models/chat-message";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ProjectChatComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  messages: ChatMessage[] = [
    ChatMessage.default(),
    ChatMessage.default(),
    ChatMessage.default(),
    ChatMessage.default(),
  ];
}
