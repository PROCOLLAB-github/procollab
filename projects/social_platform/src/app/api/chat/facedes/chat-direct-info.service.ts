/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../../auth";
import { ChatService } from "../chat.service";
import { ChatDirectService } from "../chat-direct/chat-direct.service";
import { ChatMessage } from "../../../domain/chat/chat-message.model";
import { map, Observable, Subject, switchMap, takeUntil, tap } from "rxjs";
import { ApiPagination } from "projects/skills/src/models/api-pagination.model";
import { ChatDirectUIInfoService } from "./ui/chat-direct-ui-info.service";

@Injectable()
export class ChatDirectInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly chatService = inject(ChatService);
  private readonly chatDirectService = inject(ChatDirectService);
  private readonly chatDirectUIInfoService = inject(ChatDirectUIInfoService);

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

    this.initializationProfile();
  }

  /**
   * Инициализирует загрузку файлов чата
   * Для прямых чатов: загружает файлы из прямого чата
   * Для чатов проектов: загружает файлы из проекта
   *
   */
  initializationChatFiles(): void {
    if (this.chatType === "project") {
      // Загрузка файлов чата проекта
      this.chatService
        .loadProjectFiles(Number(this.route.parent?.snapshot.paramMap.get("projectId")))
        .pipe(takeUntil(this.destroy$))
        .subscribe(files => {
          this.chatFiles.set(files);
        });
    } else if (this.chatType === "direct") {
      // Загрузка файлов прямого чата
      const chatId = this.chat()?.id;
      if (chatId) {
        this.chatService
          .loadDirectChatFiles(chatId)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            files => {
              this.chatFiles.set(files);
            },
            error => {
              // Если метод не поддерживается на сервере, логируем ошибку
              console.warn("Failed to load direct chat files:", error);
            }
          );
      }
    }
  }

  private initializationProfile(): void {
    this.authService.profile.pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.currentUserId.set(u.id);
    });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.chatDirectUIInfoService.clearTypingTimeouts();
  }

  /**
   * Получает ID чата в зависимости от типа
   */
  private getChatId(): string {
    return this.chatType === "direct"
      ? this.chat()?.id ?? ""
      : this.route.parent?.snapshot.paramMap.get("projectId") ?? "";
  }

  /**
   * Загружает сообщения чата с сервера с поддержкой пагинации
   */
  private fetchMessages(type: "direct" | "project"): Observable<ApiPagination<ChatMessage>> {
    return type === "direct"
      ? this.chatDirectService
          .loadMessages(
            this.getChatId(),
            this.messages().length > 0 ? this.messages().length : 0,
            this.chatDirectUIInfoService.messagesPerFetch
          )
          .pipe(
            tap(messages => {
              this.chatDirectUIInfoService.applyInitMessagesEvent(messages);
            })
          )
      : this.chatService
          .loadMessages(
            this.getChatId(),
            this.messages().length > 0 ? this.messages().length : 0,
            this.chatDirectUIInfoService.messagesPerFetch
          )
          .pipe(
            tap(messages => {
              this.chatDirectUIInfoService.applyInitMessagesEvent(messages);
            })
          );
  }

  private initMessageEvent(): void {
    this.chatService
      .onMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.chatDirectUIInfoService.applyMessageEvent(result);
      });
  }

  private initTypingEvent(): void {
    this.chatService
      .onTyping()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.chatDirectUIInfoService.applyTypingEvent();
      });
  }

  private initEditEvent(): void {
    this.chatService
      .onEditMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.chatDirectUIInfoService.editMessahesEvent(result);
      });
  }

  private initDeleteEvent(): void {
    this.chatService
      .onDeleteMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.chatDirectUIInfoService.deleteMessagesEvent(result);
      });
  }

  private initReadEvent(): void {
    this.chatService
      .onReadMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.chatDirectUIInfoService.readMessagesEvent(result);
      });
  }

  /**
   * Обработчик запроса на загрузку дополнительных сообщений
   */
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

  /**
   * Обработчик отправки нового сообщения
   */
  onSubmitMessage(message: any): void {
    this.chatService.sendMessage({
      replyTo: message.replyTo,
      text: message.text,
      fileUrls: message.fileUrls,
      chatType: this.chatType,
      chatId: this.getChatId(),
    });
  }

  /**
   * Обработчик редактирования сообщения
   */
  onEditMessage(message: ChatMessage): void {
    this.chatService.editMessage({
      text: message.text,
      messageId: message.id,
      chatType: this.chatType,
      chatId: this.getChatId(),
    });
  }

  /**
   * Обработчик удаления сообщения
   */
  onDeleteMessage(messageId: number): void {
    this.chatService.deleteMessage({
      chatId: this.getChatId(),
      chatType: this.chatType,
      messageId,
    });
  }

  /**
   * Обработчик события печатания
   * Использует сохранённый chatType
   */
  onType(): void {
    this.chatService.startTyping({
      chatType: this.chatType,
      chatId: this.getChatId(),
    });
  }

  /**
   * Обработчик прочтения сообщения
   * Использует сохранённый chatType
   */
  onReadMessage(messageId: number): void {
    this.chatService.readMessage({
      chatType: this.chatType,
      chatId: this.getChatId(),
      messageId,
    });
  }
}
