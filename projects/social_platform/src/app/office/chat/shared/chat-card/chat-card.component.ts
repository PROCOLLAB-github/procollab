/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { ChatListItem } from "@office/chat/models/chat-item.model";
import { AuthService } from "@auth/services";
import { map } from "rxjs";
import { DayjsPipe } from "projects/core";
import { AsyncPipe } from "@angular/common";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";

@Component({
  selector: "app-chat-card",
  templateUrl: "./chat-card.component.html",
  styleUrl: "./chat-card.component.scss",
  standalone: true,
  imports: [AvatarComponent, AsyncPipe, DayjsPipe],
})
export class ChatCardComponent implements OnInit {
  constructor(private readonly authService: AuthService) {}

  @Input({ required: true }) chat!: ChatListItem;
  @Input() isLast = false;

  public unread = this.authService.profile.pipe(
    map(p => p.id !== this.chat.lastMessage.author.id && !this.chat.lastMessage.isRead),
  );

  ngOnInit(): void {}
}
