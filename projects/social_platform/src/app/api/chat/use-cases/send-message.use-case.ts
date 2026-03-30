/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { SendChatMessageDto } from "@domain/chat/chat.model";

@Injectable({ providedIn: "root" })
export class SendMessageUseCase {
  private readonly chatRealtime = inject(ChatRealtimePort);

  execute(message: SendChatMessageDto): void {
    this.chatRealtime.sendMessage(message);
  }
}
