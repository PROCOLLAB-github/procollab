/** @format */

import { Injectable } from "@angular/core";
import { WebsocketService } from "@core/services/websocket.service";
import { Observable } from "rxjs";
import { ApiService } from "@core/services";
import {
  ChatEventType,
  DeleteChatMessageDto,
  ReadChatMessageDto,
  SendChatMessageDto,
  TypingInChatDto,
  TypingInChatEventDto,
} from "@models/chat.model";

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

  sendMessage(message: SendChatMessageDto): void {
    this.websocketService.send(ChatEventType.NEW_MESSAGE, message);
  }

  deleteMessage(deleteChatMessage: DeleteChatMessageDto): void {
    this.websocketService.send(ChatEventType.DELETE_MESSAGE, deleteChatMessage);
  }

  readMessage(readChatMessage: ReadChatMessageDto): void {
    this.websocketService.send(ChatEventType.READ_MESSAGE, readChatMessage);
  }

  onTyping(): Observable<TypingInChatEventDto> {
    return this.websocketService.on<TypingInChatEventDto>(ChatEventType.TYPING);
  }

  startTyping(typing: TypingInChatDto): void {
    this.websocketService.send(ChatEventType.TYPING, typing);
  }
}
