/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { ChatWsAdapter } from "../../adapters/chat/chat-ws.adapter";
import {
  OnChangeStatus,
  OnChatMessageDto,
  OnDeleteChatMessageDto,
  OnEditChatMessageDto,
  OnReadChatMessageDto,
  TypingInChatEventDto,
} from "@domain/chat/chat.model";
import { plainToInstance } from "class-transformer";
import { map } from "rxjs";

@Injectable({ providedIn: "root" })
export class ChatRealtimeRepository implements ChatRealtimePort {
  private readonly chatWsAdapter = inject(ChatWsAdapter);

  connect() {
    return this.chatWsAdapter.connect();
  }

  sendMessage(message: Parameters<ChatRealtimePort["sendMessage"]>[0]): void {
    this.chatWsAdapter.sendMessage(message);
  }

  editMessage(message: Parameters<ChatRealtimePort["editMessage"]>[0]): void {
    this.chatWsAdapter.editMessage(message);
  }

  deleteMessage(message: Parameters<ChatRealtimePort["deleteMessage"]>[0]): void {
    this.chatWsAdapter.deleteMessage(message);
  }

  readMessage(message: Parameters<ChatRealtimePort["readMessage"]>[0]): void {
    this.chatWsAdapter.readMessage(message);
  }

  startTyping(typing: Parameters<ChatRealtimePort["startTyping"]>[0]): void {
    this.chatWsAdapter.startTyping(typing);
  }

  onMessage() {
    return this.chatWsAdapter
      .onMessage()
      .pipe(map(message => plainToInstance(OnChatMessageDto, message)));
  }

  onEditMessage() {
    return this.chatWsAdapter
      .onEditMessage()
      .pipe(map(message => plainToInstance(OnEditChatMessageDto, message)));
  }

  onDeleteMessage() {
    return this.chatWsAdapter
      .onDeleteMessage()
      .pipe(map(message => plainToInstance(OnDeleteChatMessageDto, message)));
  }

  onReadMessage() {
    return this.chatWsAdapter
      .onReadMessage()
      .pipe(map(message => plainToInstance(OnReadChatMessageDto, message)));
  }

  onTyping() {
    return this.chatWsAdapter
      .onTyping()
      .pipe(map(typing => plainToInstance(TypingInChatEventDto, typing)));
  }

  onSetOnline() {
    return this.chatWsAdapter
      .onSetOnline()
      .pipe(map(status => plainToInstance(OnChangeStatus, status)));
  }

  onSetOffline() {
    return this.chatWsAdapter
      .onSetOffline()
      .pipe(map(status => plainToInstance(OnChangeStatus, status)));
  }
}
