/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { map, noop, Observable, Subscription, tap } from "rxjs";
import { ChatService } from "projects/social_platform/src/app/api/chat/chat.service";
import { ChatMessage } from "projects/social_platform/src/app/domain/chat/chat-message.model";
import { ChatWindowComponent } from "@ui/components/chat-window/chat-window.component";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { BarComponent } from "@ui/components";
import { BackComponent } from "@uilib";
import { AuthService } from "projects/social_platform/src/app/api/auth";
import { ChatDirectService } from "projects/social_platform/src/app/api/chat/chat-direct/chat-direct.service";
import { ChatItem } from "projects/social_platform/src/app/domain/chat/chat-item.model";

/**
 * Компонент для отображения конкретного прямого чата
 *
 * Функциональность:
 * - Отображение сообщений чата с пагинацией
 * - Отправка, редактирование и удаление сообщений
 * - Обработка событий WebSocket (новые сообщения, печатание, редактирование, удаление, прочтение)
 * - Индикация печатающих пользователей
 * - Прочтение сообщений
 *
 * @selector app-chat-direct
 * @templateUrl ./chat-direct.component.html
 * @styleUrl ./chat-direct.component.scss
 */
@Component({
  selector: "app-chat-direct",
  templateUrl: "./chat-direct.component.html",
  styleUrl: "./chat-direct.component.scss",
  standalone: true,
  imports: [RouterLink, AvatarComponent, ChatWindowComponent, BarComponent, BackComponent],
})
export class ChatDirectComponent implements OnInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
    private readonly chatDirectService: ChatDirectService
  ) {}

  /**
   * Инициализация компонента
   * - Загружает данные чата из резолвера
   * - Загружает первую порцию сообщений
   * - Инициализирует обработчики WebSocket событий
   * - Получает ID текущего пользователя
   */
  ngOnInit(): void {
    // Загрузка данных чата из резолвера
    const routeData$ = this.route.data.pipe(map(r => r["data"])).subscribe(chat => {
      this.chat = chat;
    });
    this.subscriptions$.push(routeData$);

    // Загрузка первой порции сообщений
    this.fetchMessages().subscribe(noop);

    // Инициализация обработчиков WebSocket событий
    this.initMessageEvent();
    this.initTypingEvent();
    this.initDeleteEvent();
    this.initEditEvent();
    this.initReadEvent();

    // Получение ID текущего пользователя
    this.authService.profile.subscribe(u => {
      this.currentUserId = u.id;
    });
  }

  /**
   * Очистка подписок при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  /** ID текущего пользователя */
  currentUserId?: number;

  /**
   * Количество сообщений, загружаемых за один запрос
   * @private
   */
  private readonly messagesPerFetch = 20;

  /**
   * Общее количество сообщений в чате (приходит с сервера)
   * @private
   */
  private messagesTotalCount = 0;

  /** Список пользователей, которые сейчас печатают */
  typingPersons: ChatWindowComponent["typingPersons"] = [];

  /** Массив подписок для очистки */
  subscriptions$: Subscription[] = [];

  /** Данные текущего чата */
  chat?: ChatItem;

  /** Массив сообщений чата */
  messages: ChatMessage[] = [];

  /**
   * Загружает сообщения чата с сервера с поддержкой пагинации
   *
   * @private
   * @returns {Observable<ApiPagination<ChatMessage>>} Observable с пагинированными сообщениями
   */
  private fetchMessages(): Observable<ApiPagination<ChatMessage>> {
    return this.chatDirectService
      .loadMessages(
        this.chat?.id ?? "",
        this.messages.length > 0 ? this.messages.length : 0,
        this.messagesPerFetch
      )
      .pipe(
        tap(messages => {
          // Добавляем новые сообщения в начало массива (реверсируем порядок с сервера)
          this.messages = messages.results.reverse().concat(this.messages);
          this.messagesTotalCount = messages.count;
        })
      );
  }

  /**
   * Инициализирует обработчик события получения нового сообщения
   * @private
   */
  private initMessageEvent(): void {
    const messageEvent$ = this.chatService.onMessage().subscribe(result => {
      this.messages = [...this.messages, result.message];
    });

    messageEvent$ && this.subscriptions$.push(messageEvent$);
  }

  /**
   * Инициализирует обработчик события печатания
   * Показывает индикатор печатания на 2 секунды
   * @private
   */
  private initTypingEvent(): void {
    const typingEvent$ = this.chatService.onTyping().subscribe(() => {
      if (!this.chat?.opponent) return;

      this.typingPersons.push({
        firstName: this.chat.opponent.firstName,
        lastName: this.chat.opponent.lastName,
        userId: this.chat.opponent.id,
      });

      // Убираем индикатор через 2 секунды
      setTimeout(() => {
        const personIdx = this.typingPersons.findIndex(p => p.userId === this.chat?.opponent.id);
        this.typingPersons.splice(personIdx, 1);
      }, 2000);
    });

    typingEvent$ && this.subscriptions$.push(typingEvent$);
  }

  /**
   * Инициализирует обработчик события редактирования сообщения
   * @private
   */
  private initEditEvent(): void {
    const editEvent$ = this.chatService.onEditMessage().subscribe(result => {
      const messageIdx = this.messages.findIndex(msg => msg.id === result.message.id);

      const messages = JSON.parse(JSON.stringify(this.messages));
      messages.splice(messageIdx, 1, result.message);

      this.messages = messages;
    });

    editEvent$ && this.subscriptions$.push(editEvent$);
  }

  /**
   * Инициализирует обработчик события удаления сообщения
   * @private
   */
  private initDeleteEvent(): void {
    const deleteEvent$ = this.chatService.onDeleteMessage().subscribe(result => {
      const messageIdx = this.messages.findIndex(msg => msg.id === result.messageId);

      const messages = JSON.parse(JSON.stringify(this.messages));
      messages.splice(messageIdx, 1);

      this.messages = messages;
    });

    deleteEvent$ && this.subscriptions$.push(deleteEvent$);
  }

  /**
   * Инициализирует обработчик события прочтения сообщения
   * @private
   */
  private initReadEvent(): void {
    const readEvent$ = this.chatService.onReadMessage().subscribe(result => {
      const messageIdx = this.messages.findIndex(msg => msg.id === result.messageId);

      const messages = JSON.parse(JSON.stringify(this.messages));
      messages.splice(messageIdx, 1, { ...messages[messageIdx], isRead: true });

      this.messages = messages;
    });

    readEvent$ && this.subscriptions$.push(readEvent$);
  }

  /** Флаг процесса загрузки сообщений */
  fetching = false;

  /**
   * Обработчик запроса на загрузку дополнительных сообщений
   * Загружает следующую порцию сообщений если есть еще сообщения на сервере
   */
  onFetchMessages(): void {
    if (
      (this.messages.length < this.messagesTotalCount ||
        // messagesTotalCount равен 0 в начале, поэтому тоже нужно загружать
        this.messagesTotalCount === 0) &&
      !this.fetching
    ) {
      this.fetching = true;
      this.fetchMessages().subscribe(() => {
        this.fetching = false;
      });
    }
  }

  /**
   * Обработчик отправки нового сообщения
   * @param message - Объект сообщения с текстом, файлами и ответом
   */
  onSubmitMessage(message: any): void {
    this.chatService.sendMessage({
      replyTo: message.replyTo,
      text: message.text,
      fileUrls: message.fileUrls,
      chatType: "direct",
      chatId: this.chat?.id ?? "",
    });
  }

  /**
   * Обработчик редактирования сообщения
   * @param message - Объект сообщения с новым текстом и ID
   */
  onEditMessage(message: any): void {
    this.chatService.editMessage({
      text: message.text,
      messageId: message.id,
      chatType: "direct",
      chatId: this.chat?.id ?? "",
    });
  }

  /**
   * Обработчик удаления сообщения
   * @param messageId - ID удаляемого сообщения
   */
  onDeleteMessage(messageId: number): void {
    this.chatService.deleteMessage({
      chatId: this.chat?.id ?? "",
      chatType: "direct",
      messageId,
    });
  }

  /**
   * Обработчик события печатания
   * Отправляет уведомление о том, что пользователь печатает
   */
  onType() {
    this.chatService.startTyping({ chatType: "direct", chatId: this.chat?.id ?? "" });
  }

  /**
   * Обработчик прочтения сообщения
   * @param messageId - ID прочитанного сообщения
   */
  onReadMessage(messageId: number) {
    this.chatService.readMessage({
      chatType: "direct",
      chatId: this.chat?.id ?? "",
      messageId,
    });
  }
}
