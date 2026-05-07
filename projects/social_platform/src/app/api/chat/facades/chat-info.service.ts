/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NavService } from "@ui/services/nav/nav.service";
import { ChatListItem } from "@domain/chat/chat-item.model";
import { combineLatest, map, Observable, Subject, takeUntil } from "rxjs";
import { toObservable } from "@angular/core/rxjs-interop";
import { ChatUIInfoService } from "./ui/chat-ui-info.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { AppRoutes } from "@api/paths/app-routes";
import { ChatStateService } from "../chat-state.service";
import { ObserveMessagesUseCase } from "../use-cases/observe-messages.use-case";

@Injectable()
export class ChatInfoService {
  private readonly navService = inject(NavService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authRepository = inject(AuthRepositoryPort);
  private readonly chatStateService = inject(ChatStateService);
  private readonly observeMessagesUseCase = inject(ObserveMessagesUseCase);
  private readonly chatUIInfoService = inject(ChatUIInfoService);
  private readonly logger = inject(LoggerService);

  private readonly destroy$ = new Subject<void>();

  private readonly chatsData = this.chatUIInfoService.chatsData;

  readonly chats: Observable<ChatListItem[]> = combineLatest([
    this.authRepository.profile,
    toObservable(this.chatsData),
  ]).pipe(
    map(([profile, chats]) =>
      chats.map(chat => ({
        ...chat,
        isUnread: profile.id !== chat.lastMessage.author.id && !chat.lastMessage.isRead,
      }))
    ),
    map(chats => chats.sort((a, b) => Number(b.isUnread) - Number(a.isUnread))),
    takeUntil(this.destroy$)
  );

  initializationChats(): void {
    this.navService.setNavTitle("Чат");

    setTimeout(() => {
      this.chatStateService.setUnread(false);
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
