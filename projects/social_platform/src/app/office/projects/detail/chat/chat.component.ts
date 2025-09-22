/** @format */

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ChatFile, ChatMessage } from "@models/chat-message.model";
import { filter, map, noop, Observable, Subscription, tap } from "rxjs";
import { Project } from "@models/project.model";
import { NavService } from "@services/nav.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AuthService } from "@auth/services";
import { ModalService } from "@ui/models/modal.service";
import { ChatService } from "@services/chat.service";
import { MessageInputComponent } from "@office/features/message-input/message-input.component";
import { ChatWindowComponent } from "@office/features/chat-window/chat-window.component";
import { PluralizePipe } from "projects/core";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";
import { IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ApiPagination } from "@models/api-pagination.model";

/**
 * Компонент чата проекта
 *
 * Функциональность:
 * - Отображение чата проекта с сообщениями участников
 * - Отправка, редактирование и удаление сообщений
 * - Показ индикатора набора текста
 * - Загрузка файлов чата
 * - Пагинация сообщений при прокрутке
 * - Мобильная версия с переключением между чатом и боковой панелью
 *
 * Принимает:
 * - Данные проекта через ActivatedRoute
 * - WebSocket события через ChatService
 * - Профиль пользователя через AuthService
 *
 * Предоставляет:
 * - Список сообщений чата
 * - Список участников проекта
 * - Файлы, загруженные в чат
 * - Интерфейс для отправки сообщений
 */
@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrl: "./chat.component.scss",
  standalone: true,
  imports: [
    AvatarComponent,
    IconComponent,
    ChatWindowComponent,
    RouterLink,
    FileItemComponent,
    PluralizePipe,
  ],
})
export class ProjectChatComponent implements OnInit, OnDestroy {
  constructor(
    private readonly navService: NavService,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly modalService: ModalService,
    private readonly chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.navService.setNavTitle("Чат проекта");

    // Получение ID текущего пользователя
    const profile$ = this.authService.profile.subscribe(profile => {
      this.currentUserId = profile.id;
    });
    profile$ && this.subscriptions$.push(profile$);

    // Загрузка данных проекта
    const projectSub$ = this.route.data.pipe(map(r => r["data"])).subscribe(project => {
      this.project = project;
    });
    projectSub$ && this.subscriptions$.push(projectSub$);

    console.debug("Chat websocket connected from ProjectChatComponent");

    // Инициализация WebSocket событий
    this.initTypingEvent(); // Показ индикатора набора текста
    this.initMessageEvent(); // Получение новых сообщений
    this.initEditEvent(); // Обновление отредактированных сообщений
    this.initDeleteEvent(); // Удаление сообщений

    // Загрузка истории сообщений
    this.fetchMessages().subscribe(noop);

    // Загрузка файлов чата
    this.chatService
      .loadProjectFiles(Number(this.route.parent?.snapshot.paramMap.get("projectId")))
      .subscribe(files => {
        this.chatFiles = files;
      });
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  /**
   * Количество сообщений, загружаемых за один запрос
   * @private
   */
  private readonly messagesPerFetch = 20;

  /**
   * Общее количество сообщений в чате
   * Устанавливается при первой загрузке
   * @private
   */
  private messagesTotalCount = 0;

  /** Массив всех подписок компонента */
  subscriptions$: Subscription[] = [];

  /** Данные проекта */
  project?: Project;

  /** Все файлы, загруженные в чат */
  chatFiles?: ChatFile[];

  /** ID текущего пользователя */
  currentUserId?: number;

  /** Ссылка на компонент ввода сообщений */
  @ViewChild(MessageInputComponent, { read: ElementRef }) messageInputComponent?: ElementRef;

  /** Все сообщения чата */
  messages: ChatMessage[] = [];

  /** Количество пользователей онлайн (устарело) */
  membersOnlineCount = 3;

  /** Список пользователей, которые сейчас печатают */
  typingPersons: ChatWindowComponent["typingPersons"] = [];

  /** Флаг отображения боковой панели на мобильных устройствах */
  isAsideMobileShown = false;

  /** Переключение боковой панели на мобильных устройствах */
  onToggleMobileAside(): void {
    this.isAsideMobileShown = !this.isAsideMobileShown;
  }

  /**
   * Инициализация обработки события набора текста
   * Показывает индикатор, когда другие участники печатают
   * @private
   */
  private initTypingEvent(): void {
    const typingEvent$ = this.chatService
      .onTyping()
      .pipe(
        map(typingEvent =>
          this.project?.collaborators.find(
            collaborator => collaborator.userId === typingEvent.userId
          )
        ),
        filter(Boolean)
      )
      .subscribe(person => {
        if (
          !this.typingPersons.map(p => p.userId).includes(person.userId) &&
          person.userId !== this.currentUserId
        )
          this.typingPersons.push({
            firstName: person.firstName,
            lastName: person.lastName,
            userId: person.userId,
          });

        // Автоматическое скрытие индикатора через 2 секунды
        setTimeout(() => {
          const personIdx = this.typingPersons.findIndex(p => p.userId === person.userId);
          this.typingPersons.splice(personIdx, 1);
        }, 2000);
      });

    typingEvent$ && this.subscriptions$.push(typingEvent$);
  }

  /**
   * Инициализация обработки новых сообщений
   * Добавляет новые сообщения в конец списка
   * @private
   */
  private initMessageEvent(): void {
    const messageEvent$ = this.chatService.onMessage().subscribe(result => {
      this.messages = [...this.messages, result.message];
    });

    messageEvent$ && this.subscriptions$.push(messageEvent$);
  }

  /**
   * Инициализация обработки редактирования сообщений
   * Обновляет отредактированные сообщения в списке
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
   * Инициализация обработки удаления сообщений
   * Удаляет сообщения из списка
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
   * Загрузка сообщений чата с сервера
   * @private
   * @returns Observable с пагинированными сообщениями
   */
  private fetchMessages(): Observable<ApiPagination<ChatMessage>> {
    return this.chatService
      .loadMessages(
        Number(this.route.parent?.snapshot.paramMap.get("projectId")),
        this.messages.length > 0 ? this.messages.length : 0,
        this.messagesPerFetch
      )
      .pipe(
        tap(messages => {
          this.messages = messages.results.reverse().concat(this.messages);
          this.messagesTotalCount = messages.count;
        })
      );
  }

  /** Флаг процесса загрузки сообщений */
  fetching = false;

  /** Загрузка дополнительных сообщений при прокрутке */
  onFetchMessages(): void {
    if (
      (this.messages.length < this.messagesTotalCount || this.messagesTotalCount === 0) &&
      !this.fetching
    ) {
      this.fetching = true;
      this.fetchMessages().subscribe(() => {
        this.fetching = false;
      });
    }
  }

  /** Отправка нового сообщения */
  onSubmitMessage(message: any): void {
    this.chatService.sendMessage({
      replyTo: message.replyTo,
      text: message.text,
      fileUrls: message.fileUrls,
      chatType: "project",
      chatId: this.route.parent?.snapshot.paramMap.get("projectId") ?? "",
    });
  }

  /** Редактирование существующего сообщения */
  onEditMessage(message: any): void {
    this.chatService.editMessage({
      text: message.text,
      messageId: message.id,
      chatType: "project",
      chatId: this.route.parent?.snapshot.paramMap.get("projectId") ?? "",
    });
  }

  /** Удаление сообщения */
  onDeleteMessage(messageId: number): void {
    this.chatService.deleteMessage({
      chatId: this.route.parent?.snapshot.paramMap.get("projectId") ?? "",
      chatType: "project",
      messageId,
    });
  }
}
