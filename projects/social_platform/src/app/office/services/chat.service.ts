/** @format */

import { Injectable } from "@angular/core";
import { WebsocketService } from "@core/services/websocket.service";
import { BehaviorSubject, map, Observable } from "rxjs";
import { ApiService } from "projects/core";
import {
  ChatEventType,
  DeleteChatMessageDto,
  EditChatMessageDto,
  LoadChatMessages,
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
import { HttpParams } from "@angular/common/http";
import { ChatFile } from "@models/chat-message.model";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  constructor(
    private readonly websocketService: WebsocketService,
    private readonly apiService: ApiService
  ) {}

  public connect(): Observable<void> {
    const accessToken = localStorage.getItem("accessToken");

    return this.websocketService.connect(`/chat/?token=${accessToken}`);
  }

  public userOnlineStatusCache = new BehaviorSubject<Record<number, boolean>>({});
  setOnlineStatus(userId: number, status: boolean) {
    this.userOnlineStatusCache.next({ ...this.userOnlineStatusCache, [userId]: status });
  }

  onSetOffline(): Observable<OnChangeStatus> {
    return this.websocketService
      .on<OnChangeStatus>(ChatEventType.SET_OFFLINE)
      .pipe(map(status => plainToInstance(OnChangeStatus, status)));
  }

  onSetOnline(): Observable<OnChangeStatus> {
    return this.websocketService
      .on<OnChangeStatus>(ChatEventType.SET_ONLINE)
      .pipe(map(status => plainToInstance(OnChangeStatus, status)));
  }

  onTyping(): Observable<TypingInChatEventDto> {
    return this.websocketService
      .on<TypingInChatEventDto>(ChatEventType.TYPING)
      .pipe(map(typing => plainToInstance(TypingInChatEventDto, typing)));
  }

  startTyping(typing: TypingInChatDto): void {
    this.websocketService.send(ChatEventType.TYPING, typing);
  }

  deleteMessage(deleteChatMessage: DeleteChatMessageDto): void {
    this.websocketService.send(ChatEventType.DELETE_MESSAGE, deleteChatMessage);
  }

  readMessage(readChatMessage: ReadChatMessageDto): void {
    this.websocketService.send(ChatEventType.READ_MESSAGE, readChatMessage);
  }

  loadMessages(projectId: number, count?: number, take?: number): Observable<LoadChatMessages> {
    let queries = new HttpParams();
    if (count !== undefined) queries = queries.set("offset", count);
    if (take !== undefined) queries = queries.set("limit", take);

    return this.apiService.get<LoadChatMessages>(`/chats/projects/${projectId}/messages/`, queries);
  }

  loadProjectFiles(projectId: number): Observable<ChatFile[]> {
    return this.apiService
      .get<ChatFile[]>(`/chats/projects/${projectId}/files`)
      .pipe(map(r => plainToInstance(ChatFile, r)));
  }

  unread$ = new BehaviorSubject(false);
  hasUnreads(): Observable<boolean> {
    return this.apiService
      .get<{ hasUnreads: boolean }>("/chats/has-unreads")
      .pipe(map(r => r.hasUnreads));
  }

  sendMessage(message: SendChatMessageDto): void {
    this.websocketService.send(ChatEventType.NEW_MESSAGE, message);
  }

  onMessage(): Observable<OnChatMessageDto> {
    return this.websocketService
      .on<OnChatMessageDto>(ChatEventType.NEW_MESSAGE)
      .pipe(map(message => plainToInstance(OnChatMessageDto, message)));
  }

  onEditMessage(): Observable<OnEditChatMessageDto> {
    return this.websocketService
      .on<OnEditChatMessageDto>(ChatEventType.EDIT_MESSAGE)
      .pipe(map(message => plainToInstance(OnEditChatMessageDto, message)));
  }

  onDeleteMessage(): Observable<OnDeleteChatMessageDto> {
    return this.websocketService
      .on<OnDeleteChatMessageDto>(ChatEventType.DELETE_MESSAGE)
      .pipe(map(message => plainToInstance(OnDeleteChatMessageDto, message)));
  }

  onReadMessage(): Observable<OnReadChatMessageDto> {
    return this.websocketService
      .on<OnDeleteChatMessageDto>(ChatEventType.READ_MESSAGE)
      .pipe(map(message => plainToInstance(OnReadChatMessageDto, message)));
  }

  editMessage(message: EditChatMessageDto): void {
    this.websocketService.send(ChatEventType.EDIT_MESSAGE, message);
  }
}
