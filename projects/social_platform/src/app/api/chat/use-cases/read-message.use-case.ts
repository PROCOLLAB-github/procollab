/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { ReadChatMessageDto } from "@domain/chat/chat.model";

/** Команда (WS): отметить сообщение прочитанным. */
@Injectable({ providedIn: "root" })
export class ReadMessageUseCase {
  private readonly chatRealtime = inject(ChatRealtimePort);

  execute(message: ReadChatMessageDto): void {
    this.chatRealtime.readMessage(message);
  }
}
