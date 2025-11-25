/** @format */

import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { WebsocketService } from "@core/services/websocket.service";
import { ApiPagination } from "@models/api-pagination.model";
import { ChatFile, ChatMessage } from "@models/chat-message.model";
import {
  ChatEventType,
  DeleteChatMessageDto,
  EditChatMessageDto,
  OnChangeStatus,
  OnChatMessageDto,
  OnDeleteChatMessageDto,
  OnEditChatMessageDto,
  OnReadChatMessageDto,
  ReadChatMessageDto,
  SendChatMessageDto,
  TypingInChatDto,
  TypingInChatEventDto,
} from "@models/chat.model";
import { plainToInstance } from "class-transformer";
import { ApiService, TokenService } from "projects/core";
import { BehaviorSubject, map, Observable } from "rxjs";

/**
 * Сервис для управления чатом в реальном времени
 *
 * Предоставляет функциональность для:
 * - Подключения к WebSocket для обмена сообщениями в реальном времени
 * - Отправки, редактирования и удаления сообщений
 * - Отслеживания статуса пользователей (онлайн/оффлайн)
 * - Индикации набора текста
 * - Загрузки истории сообщений и файлов
 * - Отметки сообщений как прочитанных
 */
@Injectable({
  providedIn: "root",
})
export class ChatService {
  private readonly CHATS_URL = "/chats";

  constructor(
    private readonly websocketService: WebsocketService,
    private readonly apiService: ApiService,
    private readonly tokenService: TokenService
  ) {}

  /**
   * Устанавливает WebSocket соединение для чата
   * Использует токен доступа для аутентификации
   *
   * @returns Observable<void> - завершается при успешном подключении
   * @throws Error если токен не найден
   */
  public connect(): Observable<void> {
    const tokens = this.tokenService.getTokens();
    if (!tokens) throw new Error("No token provided");

    return this.websocketService.connect(`/chat/`);
  }

  /**
   * Кеш статусов пользователей (онлайн/оффлайн)
   * Ключ - ID пользователя, значение - статус онлайн (true/false)
   */
  public userOnlineStatusCache = new BehaviorSubject<Record<number, boolean>>({});

  /**
   * Обновляет статус пользователя в кеше
   *
   * @param userId - идентификатор пользователя
   * @param status - статус онлайн (true - онлайн, false - оффлайн)
   */
  setOnlineStatus(userId: number, status: boolean) {
    this.userOnlineStatusCache.next({ ...this.userOnlineStatusCache, [userId]: status });
  }

  /**
   * Подписывается на события перехода пользователей в оффлайн
   *
   * @returns Observable<OnChangeStatus> - поток событий с информацией о пользователе, ушедшем в оффлайн
   */
  onSetOffline(): Observable<OnChangeStatus> {
    return this.websocketService
      .on<OnChangeStatus>(ChatEventType.SET_OFFLINE)
      .pipe(map(status => plainToInstance(OnChangeStatus, status)));
  }

  /**
   * Подписывается на события перехода пользователей в онлайн
   *
   * @returns Observable<OnChangeStatus> - поток событий с информацией о пользователе, вошедшем в онлайн
   */
  onSetOnline(): Observable<OnChangeStatus> {
    return this.websocketService
      .on<OnChangeStatus>(ChatEventType.SET_ONLINE)
      .pipe(map(status => plainToInstance(OnChangeStatus, status)));
  }

  /**
   * Подписывается на события набора текста другими пользователями
   *
   * @returns Observable<TypingInChatEventDto> - поток событий с информацией о том, кто печатает
   */
  onTyping(): Observable<TypingInChatEventDto> {
    return this.websocketService
      .on<TypingInChatEventDto>(ChatEventType.TYPING)
      .pipe(map(typing => plainToInstance(TypingInChatEventDto, typing)));
  }

  /**
   * Отправляет событие о начале набора текста
   *
   * @param typing - объект с информацией о наборе текста (проект, пользователь)
   */
  startTyping(typing: TypingInChatDto): void {
    this.websocketService.send(ChatEventType.TYPING, typing);
  }

  /**
   * Отправляет команду на удаление сообщения
   *
   * @param deleteChatMessage - объект с идентификатором сообщения для удаления
   */
  deleteMessage(deleteChatMessage: DeleteChatMessageDto): void {
    this.websocketService.send(ChatEventType.DELETE_MESSAGE, deleteChatMessage);
  }

  /**
   * Отправляет команду на отметку сообщения как прочитанного
   *
   * @param readChatMessage - объект с идентификатором сообщения для отметки
   */
  readMessage(readChatMessage: ReadChatMessageDto): void {
    this.websocketService.send(ChatEventType.READ_MESSAGE, readChatMessage);
  }

  /**
   * Загружает историю сообщений для проекта с пагинацией
   *
   * @param projectId - идентификатор проекта
   * @param count - смещение (количество пропускаемых сообщений)
   * @param take - лимит сообщений для загрузки
   * @returns Observable<ApiPagination<ChatMessage>> - объект с массивом сообщений и метаданными пагинации
   */
  loadMessages(
    projectId: number,
    count?: number,
    take?: number
  ): Observable<ApiPagination<ChatMessage>> {
    let queries = new HttpParams();
    if (count !== undefined) queries = queries.set("offset", count);
    if (take !== undefined) queries = queries.set("limit", take);

    return this.apiService.get<ApiPagination<ChatMessage>>(
      `${this.CHATS_URL}/projects/${projectId}/messages/`,
      queries
    );
  }

  /**
   * Загружает список файлов, отправленных в чате проекта
   *
   * @param projectId - идентификатор проекта
   * @returns Observable<ChatFile[]> - массив файлов с метаданными
   */
  loadProjectFiles(projectId: number): Observable<ChatFile[]> {
    return this.apiService
      .get<ChatFile[]>(`${this.CHATS_URL}/projects/${projectId}/files`)
      .pipe(map(r => plainToInstance(ChatFile, r)));
  }

  /**
   * BehaviorSubject для отслеживания наличия непрочитанных сообщений
   */
  unread$ = new BehaviorSubject(false);

  /**
   * Проверяет наличие непрочитанных сообщений у пользователя
   *
   * @returns Observable<boolean> - true если есть непрочитанные сообщения
   */
  hasUnreads(): Observable<boolean> {
    return this.apiService
      .get<{ hasUnreads: boolean }>(`${this.CHATS_URL}/has-unreads`)
      .pipe(map(r => r.hasUnreads));
  }

  /**
   * Отправляет новое сообщение в чат
   *
   * @param message - объект сообщения с текстом, файлами и метаданными
   */
  sendMessage(message: SendChatMessageDto): void {
    this.websocketService.send(ChatEventType.NEW_MESSAGE, message);
  }

  /**
   * Подписывается на получение новых сообщений
   *
   * @returns Observable<OnChatMessageDto> - поток новых сообщений
   */
  onMessage(): Observable<OnChatMessageDto> {
    return this.websocketService
      .on<OnChatMessageDto>(ChatEventType.NEW_MESSAGE)
      .pipe(map(message => plainToInstance(OnChatMessageDto, message)));
  }

  /**
   * Подписывается на события редактирования сообщений
   *
   * @returns Observable<OnEditChatMessageDto> - поток событий редактирования сообщений
   */
  onEditMessage(): Observable<OnEditChatMessageDto> {
    return this.websocketService
      .on<OnEditChatMessageDto>(ChatEventType.EDIT_MESSAGE)
      .pipe(map(message => plainToInstance(OnEditChatMessageDto, message)));
  }

  /**
   * Подписывается на события удаления сообщений
   *
   * @returns Observable<OnDeleteChatMessageDto> - поток событий удаления сообщений
   */
  onDeleteMessage(): Observable<OnDeleteChatMessageDto> {
    return this.websocketService
      .on<OnDeleteChatMessageDto>(ChatEventType.DELETE_MESSAGE)
      .pipe(map(message => plainToInstance(OnDeleteChatMessageDto, message)));
  }

  /**
   * Подписывается на события прочтения сообщений
   *
   * @returns Observable<OnReadChatMessageDto> - поток событий прочтения сообщений
   */
  onReadMessage(): Observable<OnReadChatMessageDto> {
    return this.websocketService
      .on<OnDeleteChatMessageDto>(ChatEventType.READ_MESSAGE)
      .pipe(map(message => plainToInstance(OnReadChatMessageDto, message)));
  }

  /**
   * Отправляет команду на редактирование сообщения
   *
   * @param message - объект с идентификатором сообщения и новым содержимым
   */
  editMessage(message: EditChatMessageDto): void {
    this.websocketService.send(ChatEventType.EDIT_MESSAGE, message);
  }
}
