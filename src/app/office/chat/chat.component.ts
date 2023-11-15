/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "@services/nav.service";
import { ActivatedRoute, Router } from "@angular/router";
import { combineLatest, map, Observable } from "rxjs";
import { ChatListItem } from "@office/chat/models/chat-item.model";
import { AuthService } from "@auth/services";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit {
  constructor(
    private readonly navService: NavService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  chats: Observable<ChatListItem[]> = combineLatest([
    this.authService.profile,
    this.route.data.pipe<ChatListItem[]>(map(r => r["data"])),
  ]).pipe(
    map(([profile, chats]) =>
      chats.map(chat => ({
        ...chat,
        unRead: profile.id !== chat.lastMessage.author.id && !chat.lastMessage.isRead,
      }))
    ),
    map(chats =>
      chats.sort((prev, next) => {
        if (prev.unRead && !next.unRead) return -1;
        else if (!prev.unRead && next.unRead) return 1;
        else return 0;
      })
    ),
    map(chats =>
      chats.map(chat => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete chat.unread;
        return chat;
      })
    )
  );

  ngOnInit(): void {
    this.navService.setNavTitle("Чат");
  }

  onGotoChat(id: string | number) {
    const redirectUrl =
      typeof id === "string" && id.includes("_")
        ? `/office/chats/${id}`
        : `/office/projects/${id}/chat`;

    this.router
      .navigateByUrl(redirectUrl)
      .then(() => console.debug("Route changed from ChatComponent"));
  }
}
