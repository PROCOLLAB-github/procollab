/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { ChatMessage } from "../../../office/models/chat-message";

@Component({
  selector: "app-chat-message",
  templateUrl: "./chat-message.component.html",
  styleUrls: ["./chat-message.component.scss"],
})
export class ChatMessageComponent implements OnInit {
  constructor() {}

  @Input() chatMessage!: ChatMessage;

  ngOnInit(): void {}
}
