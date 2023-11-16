/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { ChatListItem } from "@office/chat/models/chat-item.model";
import { AuthService } from "@auth/services";
import { map } from "rxjs";

@Component({
  selector: "app-chat-card",
  templateUrl: "./chat-card.component.html",
  styleUrls: ["./chat-card.component.scss"],
})
export class ChatCardComponent implements OnInit {
  constructor(private readonly authService: AuthService) {}

  @Input() chat!: ChatListItem;
  @Input() isLast = false;

  public unread = this.authService.profile.pipe(
    map(p => p.id !== this.chat.lastMessage.author.id && !this.chat.lastMessage.isRead)
  );

  ngOnInit(): void {}
}
