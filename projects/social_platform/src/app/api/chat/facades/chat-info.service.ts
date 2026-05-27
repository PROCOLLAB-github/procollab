/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NavService } from "@ui/services/nav/nav.service";
import { ChatListItem } from "@domain/chat/chat-item.model";
import { combineLatest, map, Observable, Subject, takeUntil } from "rxjs";
import { toObservable } from "@angular/core/rxjs-interop";
import { ChatUIInfoService } from "./ui/chat-ui-info.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { AppRoutes } from "@api/paths/app-routes";
import { ChatUnreadStateService } from "../chat-unread-state.service";
import { ObserveMessagesUseCase } from "../use-cases/observe-messages.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";

/** Управляет списком личных/групповых чатов и глобальным индикатором непрочитанных. */
@Injectable()
export class ChatInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navService = inject(NavService);
  private readonly chatUnreadState = inject(ChatUnreadStateService);
  private readonly chatUIInfoService = inject(ChatUIInfoService);
  private readonly profileInfoService = inject(ProfileInfoService);
  private readonly logger = inject(LoggerService);
  private readonly observeMessagesUseCase = inject(ObserveMessagesUseCase);

  private readonly destroy$ = new Subject<void>();

  private readonly chatsData = this.chatUIInfoService.chatsData;
  private readonly profile = this.profileInfoService.profile;

  readonly chats: Observable<ChatListItem[]> = toObservable(this.chatsData).pipe(
    // Непрочитанность считается относительно текущего пользователя.
    map(chats =>
      chats.map(chat => ({
        ...chat,
        isUnread: this.profile()!.id !== chat.lastMessage.author.id && !chat.lastMessage.isRead,
      }))
    ),
    map(chats => chats.sort((a, b) => Number(b.isUnread) - Number(a.isUnread))),
    takeUntil(this.destroy$)
  );

  initializationChats(): void {
    this.navService.setNavTitle("Чат");

    setTimeout(() => {
      this.chatUnreadState.markRead();
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
    this.observeMessagesUseCase
      .execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.chatUIInfoService.applyInitializationMessages(result);
      });
  }

  onGotoChat(id: string | number) {
    const redirectUrl =
      typeof id === "string" && id.includes("_")
        ? AppRoutes.chats.detail(id)
        : AppRoutes.projects.chat(id);

    this.router
      .navigateByUrl(redirectUrl)
      .then(() => this.logger.debug("Route changed from ChatComponent"));
  }
}
