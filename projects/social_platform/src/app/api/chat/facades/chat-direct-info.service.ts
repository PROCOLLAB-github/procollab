/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ChatMessage } from "@domain/chat/chat-message.model";
import { map, Observable, Subject, switchMap, takeUntil, tap } from "rxjs";
import { ChatDirectUIInfoService } from "./ui/chat-direct-ui-info.service";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { LoadProjectFilesUseCase } from "../use-cases/load-project-files.use-case";
import { LoadMessagesUseCase } from "../use-cases/load-messages.use-case";
import { ObserveMessagesUseCase } from "../use-cases/observe-messages.use-case";
import { ObserveTypingUseCase } from "../use-cases/observe-typing.use-case";
import { ObserveEditMessageUseCase } from "../use-cases/observe-edit-message.use-case";
import { ObserveDeleteMessageUseCase } from "../use-cases/observe-delete-message.use-case";
import { ObserveReadMessageUseCase } from "../use-cases/observe-read-message.use-case";
import { SendMessageUseCase } from "../use-cases/send-message.use-case";
import { EditMessageUseCase } from "../use-cases/edit-message.use-case";
import { DeleteMessageUseCase } from "../use-cases/delete-message.use-case";
import { StartTypingUseCase } from "../use-cases/start-typing.use-case";
import { ReadMessageUseCase } from "../use-cases/read-message.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";

/** Фасад личного чата: загрузка истории/файлов и подписки realtime (печать, read, edit/delete), отправка сообщений. */
@Injectable()
export class ChatDirectInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly chatDirectUIInfoService = inject(ChatDirectUIInfoService);
  private readonly profileInfoService = inject(ProfileInfoService);
  private readonly loadProjectFilesUseCase = inject(LoadProjectFilesUseCase);
  private readonly loadMessagesUseCase = inject(LoadMessagesUseCase);
  private readonly observeMessagesUseCase = inject(ObserveMessagesUseCase);
  private readonly observeTypingUseCase = inject(ObserveTypingUseCase);
  private readonly observeEditMessageUseCase = inject(ObserveEditMessageUseCase);
  private readonly observeDeleteMessageUseCase = inject(ObserveDeleteMessageUseCase);
  private readonly observeReadMessageUseCase = inject(ObserveReadMessageUseCase);
  private readonly sendMessageUseCase = inject(SendMessageUseCase);
  private readonly editMessageUseCase = inject(EditMessageUseCase);
  private readonly deleteMessageUseCase = inject(DeleteMessageUseCase);
  private readonly startTypingUseCase = inject(StartTypingUseCase);
  private readonly readMessageUseCase = inject(ReadMessageUseCase);

  private readonly destroy$ = new Subject<void>();

  // Сохраняем тип чата для использования в методах
  private chatType: "direct" | "project" = "direct";

  /** Список пользователей, которые сейчас печатают */
  readonly typingPersons = this.chatDirectUIInfoService.typingPersons;

  /** Данные текущего чата */
  readonly chat = this.chatDirectUIInfoService.chat;

  /** Массив сообщений чата */
  readonly messages = this.chatDirectUIInfoService.messages;

  /** Все файлы, загруженные в чат */
  readonly chatFiles = this.chatDirectUIInfoService.chatFiles;

  /** ID текущего пользователя */
  readonly currentUserId = this.chatDirectUIInfoService.currentUserId;

  /** Флаг процесса загрузки сообщений */
  readonly fetching = this.chatDirectUIInfoService.fetching;

  private readonly profile = this.profileInfoService.profile;

  initializationChatDirect(type: "direct" | "project"): void {
    this.chatType = type; // Сохраняем тип чата

    this.route.data
      .pipe(
        map(r => r["data"]),
        tap(chat => this.chat.set(chat)),
        switchMap(() => this.fetchMessages(type)),
        takeUntil(this.destroy$)
      )
      .subscribe();

    // Инициализация обработчиков WebSocket событий
    this.initMessageEvent();
    this.initTypingEvent();
    this.initDeleteEvent();
    this.initEditEvent();
    this.initReadEvent();

    this.profileInfoService.ensureProfileLoaded();
  }

  initializationChatFiles(): void {
    this.loadProjectFilesUseCase
      .execute(Number(this.route.parent?.snapshot.paramMap.get("projectId")))
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) {
          return;
        }

        this.chatFiles.set(result.value);
      });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.chatDirectUIInfoService.clearTypingTimeouts();
  }

  private getChatId(): string {
    return this.chatType === "direct"
      ? this.chat()?.id ?? ""
      : this.route.parent?.snapshot.paramMap.get("projectId") ?? "";
  }

  private fetchMessages(type: "direct" | "project"): Observable<ApiPagination<ChatMessage>> {
    return this.loadMessagesUseCase
      .execute(
        +this.getChatId(),
        type === "direct" ? "directs" : "projects",
        this.messages().length > 0 ? this.messages().length : 0,
        this.chatDirectUIInfoService.messagesPerFetch
      )
      .pipe(
        tap(result => {
          if (result.ok) {
            this.chatDirectUIInfoService.applyInitMessagesEvent(result.value);
          }
        }),
        map(result =>
          result.ok
            ? result.value
            : ({ count: 0, results: [], next: "", previous: "" } as ApiPagination<ChatMessage>)
        )
      );
  }

  private initMessageEvent(): void {
    this.observeMessagesUseCase
      .execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.chatDirectUIInfoService.applyMessageEvent(result);
      });
  }

  private initTypingEvent(): void {
    this.observeTypingUseCase
      .execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.chatDirectUIInfoService.applyTypingEvent();
      });
  }

  private initEditEvent(): void {
    this.observeEditMessageUseCase
      .execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.chatDirectUIInfoService.editMessahesEvent(result);
      });
  }

  private initDeleteEvent(): void {
    this.observeDeleteMessageUseCase
      .execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.chatDirectUIInfoService.deleteMessagesEvent(result);
      });
  }

  private initReadEvent(): void {
    this.observeReadMessageUseCase
      .execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.chatDirectUIInfoService.readMessagesEvent(result);
      });
  }

  onFetchMessages(): void {
    if (
      (this.messages().length < this.chatDirectUIInfoService.messagesTotalCount() ||
        this.chatDirectUIInfoService.messagesTotalCount() === 0) &&
      !this.fetching()
    ) {
      this.fetching.set(true);
      this.fetchMessages(this.chatType)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.fetching.set(false);
        });
    }
  }

  onSubmitMessage(message: any): void {
    this.sendMessageUseCase.execute({
      replyTo: message.replyTo,
      text: message.text,
      fileUrls: message.fileUrls,
      chatType: this.chatType,
      chatId: this.getChatId(),
    });

    // Бэк отдаёт по WS только ack-фрейм без тела, поэтому сразу добавляем сообщение локально.
    // На reload реальное сообщение из истории придёт по HTTP — это локальное затрётся при следующей загрузке чата.
    if (this.profile() && message.text) {
      const optimistic: ChatMessage = {
        id: -Date.now(),
        author: this.profile()!,
        text: message.text,
        replyTo:
          message.replyTo != null
            ? this.messages().find(m => m.id === message.replyTo) ?? null
            : null,
        files: [],
        isEdited: false,
        isRead: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
      };
      this.chatDirectUIInfoService.applyMessageEvent({
        chatId: this.getChatId(),
        message: optimistic,
      });
    }
  }

  onEditMessage(message: ChatMessage): void {
    this.editMessageUseCase.execute({
      text: message.text,
      messageId: message.id,
      chatType: this.chatType,
      chatId: this.getChatId(),
    });

    // Бэк по edit_message тоже шлёт ack без тела — без локального апдейта отредактированный текст
    // не появляется до перезагрузки. Подменяем текст в списке сразу.
    this.chatDirectUIInfoService.messages.update(list =>
      list.map(m => (m.id === message.id ? { ...m, text: message.text, isEdited: true } : m))
    );
  }

  onDeleteMessage(messageId: number): void {
    this.deleteMessageUseCase.execute({
      chatId: this.getChatId(),
      chatType: this.chatType,
      messageId,
    });
  }

  onType(): void {
    this.startTypingUseCase.execute({
      chatType: this.chatType,
      chatId: this.getChatId(),
    });
  }

  onReadMessage(messageId: number): void {
    this.readMessageUseCase.execute({
      chatType: this.chatType,
      chatId: this.getChatId(),
      messageId,
    });
  }
}
