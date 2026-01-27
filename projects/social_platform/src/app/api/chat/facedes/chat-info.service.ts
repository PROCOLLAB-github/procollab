/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NavService } from "@ui/services/nav/nav.service";
import { AuthService } from "../../auth";
import { ChatService } from "../chat.service";
import { ChatListItem } from "../../../domain/chat/chat-item.model";
import { combineLatest, map, Observable, Subject, takeUntil } from "rxjs";
import { toObservable } from "@angular/core/rxjs-interop";
import { ChatUIInfoService } from "./ui/chat-ui-info.service";

@Injectable()
export class ChatInfoService {
  private readonly navService = inject(NavService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly chatService = inject(ChatService);
  private readonly chatUIInfoService = inject(ChatUIInfoService);

  private readonly destroy$ = new Subject<void>();

  private readonly chatsData = this.chatUIInfoService.chatsData;

  readonly chats: Observable<ChatListItem[]> = combineLatest([
    this.authService.profile,
    toObservable(this.chatsData),
  ]).pipe(
    map(([profile, chats]) =>
      chats.map(chat => ({
        ...chat,
        unread: profile.id !== chat.lastMessage.author.id && !chat.lastMessage.isRead,
      }))
    ),
    map(chats => chats.sort((a, b) => Number(b.unread) - Number(a.unread))),
    map(chats => chats.map(({ unread, ...chat }) => chat)),
    takeUntil(this.destroy$)
  );

  initializationChats(): void {
    this.navService.setNavTitle("Чат");

    setTimeout(() => {
      this.chatService.unread$.next(false);
    });

    this.initializationChatMessage();

    this.route.data
      .pipe(
        map(r => r["data"]),
        takeUntil(this.destroy$)
      )
      .subscribe(chats => {
        this.chatsData.set(chats);
      });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializationChatMessage(): void {
    this.chatService
      .onMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.chatUIInfoService.applyInitializationMessages(result);
      });
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
