/** @format */

import { Injectable } from "@angular/core";
import { WebsocketService } from "@core/services/websocket.service";
import { map, Observable } from "rxjs";
import { ApiService } from "@core/services";
import {
  ChatEventType,
  DeleteChatMessageDto,
  EditChatMessageDto,
  LoadChatMessages,
  OnChatMessageDto,
  OnEditChatMessageDto,
  ReadChatMessageDto,
  SendChatMessageDto,
  TypingInChatDto,
  TypingInChatEventDto,
} from "@models/chat.model";
import { plainToInstance } from "class-transformer";
import { HttpParams } from "@angular/common/http";

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

  loadMessage(projectId: number, count = 0, take = 20): Observable<LoadChatMessages> {
    return this.apiService
      .get<LoadChatMessages>(
        `/chats/projects/${projectId}/messages/`,
        new HttpParams({ fromObject: { previous: count, next: take } })
      )
      .pipe(map(messages => plainToInstance(LoadChatMessages, messages)));
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

  editMessage(message: EditChatMessageDto): void {
    this.websocketService.send(ChatEventType.EDIT_MESSAGE, message);
  }
}
