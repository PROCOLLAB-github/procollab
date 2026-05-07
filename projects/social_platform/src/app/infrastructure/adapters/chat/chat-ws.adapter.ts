/** @format */

import { inject, Injectable } from "@angular/core";
import { WebsocketService } from "@core/lib/services/websockets/websocket.service";
import { TokenService } from "@corelib";
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
} from "@domain/chat/chat.model";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class ChatWsAdapter {
  private readonly websocketService = inject(WebsocketService);
  private readonly tokenService = inject(TokenService);

  connect(): Observable<void> {
    const tokens = this.tokenService.getTokens();
    if (!tokens) throw new Error("No token provided");

    return this.websocketService.connect("/chat/");
  }

  sendMessage(message: SendChatMessageDto): void {
    this.websocketService.send(ChatEventType.NEW_MESSAGE, message);
  }

  editMessage(message: EditChatMessageDto): void {
    this.websocketService.send(ChatEventType.EDIT_MESSAGE, message);
  }

  deleteMessage(message: DeleteChatMessageDto): void {
    this.websocketService.send(ChatEventType.DELETE_MESSAGE, message);
  }

  readMessage(message: ReadChatMessageDto): void {
    this.websocketService.send(ChatEventType.READ_MESSAGE, message);
  }

  startTyping(typing: TypingInChatDto): void {
    this.websocketService.send(ChatEventType.TYPING, typing);
  }

  onMessage(): Observable<OnChatMessageDto> {
    return this.websocketService.on<OnChatMessageDto>(ChatEventType.NEW_MESSAGE);
  }

  onEditMessage(): Observable<OnEditChatMessageDto> {
    return this.websocketService.on<OnEditChatMessageDto>(ChatEventType.EDIT_MESSAGE);
  }

  onDeleteMessage(): Observable<OnDeleteChatMessageDto> {
    return this.websocketService.on<OnDeleteChatMessageDto>(ChatEventType.DELETE_MESSAGE);
  }

  onReadMessage(): Observable<OnReadChatMessageDto> {
    return this.websocketService.on<OnReadChatMessageDto>(ChatEventType.READ_MESSAGE);
  }

  onTyping(): Observable<TypingInChatEventDto> {
    return this.websocketService.on<TypingInChatEventDto>(ChatEventType.TYPING);
  }

  onSetOnline(): Observable<OnChangeStatus> {
    return this.websocketService.on<OnChangeStatus>(ChatEventType.SET_ONLINE);
  }

  onSetOffline(): Observable<OnChangeStatus> {
    return this.websocketService.on<OnChangeStatus>(ChatEventType.SET_OFFLINE);
  }
}
