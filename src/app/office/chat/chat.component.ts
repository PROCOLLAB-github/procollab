/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "@services/nav.service";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { BehaviorSubject, combineLatest, map, Observable, Subscription } from "rxjs";
import { ChatListItem } from "@office/chat/models/chat-item.model";
import { AuthService } from "@auth/services";
import { ChatService } from "@services/chat.service";
import { ChatCardComponent } from "./shared/chat-card/chat-card.component";
import { NgFor, AsyncPipe } from "@angular/common";
import { BackComponent } from "@ui/components/back/back.component";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrl: "./chat.component.scss",
  standalone: true,
  imports: [BackComponent, RouterLink, RouterLinkActive, NgFor, ChatCardComponent, AsyncPipe],
})
export class ChatComponent implements OnInit, OnDestroy {
  constructor(
    private readonly navService: NavService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly chatService: ChatService
  ) {}

  chatsData = new BehaviorSubject<ChatListItem[]>([]);

  chats: Observable<ChatListItem[]> = combineLatest([
    this.authService.profile,
    this.chatsData,
  ]).pipe(
    map(([profile, chats]) =>
      chats.map(chat => ({
        ...chat,
        unread: profile.id !== chat.lastMessage.author.id && !chat.lastMessage.isRead,
      }))
    ),
    map(chats =>
      chats.sort((prev, next) => {
        if (prev.unread && !next.unread) return -1;
        else if (!prev.unread && next.unread) return 1;
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

    setTimeout(() => {
      this.chatService.unread$.next(false);
    });

    const messageSub$ = this.chatService.onMessage().subscribe(result => {
      const newChatsData: ChatListItem[] = JSON.parse(JSON.stringify(this.chatsData.value));
      const chatIdx = newChatsData.findIndex(c => c.id === result.chatId);

      newChatsData.splice(chatIdx, 1, { ...newChatsData[chatIdx], lastMessage: result.message });

      this.chatsData.next(newChatsData);
    });
    this.subscriptions$.push(messageSub$);

    const routeData$ = this.route.data
      .pipe<ChatListItem[]>(map(r => r["data"]))
      .subscribe(chats => {
        this.chatsData.next(chats);
      });
    this.subscriptions$.push(routeData$);
  }

  subscriptions$: Subscription[] = [];
  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
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
