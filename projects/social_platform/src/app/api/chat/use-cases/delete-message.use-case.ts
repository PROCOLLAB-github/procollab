/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { DeleteChatMessageDto } from "@domain/chat/chat.model";

@Injectable({ providedIn: "root" })
export class DeleteMessageUseCase {
  private readonly chatRealtime = inject(ChatRealtimePort);

  execute(message: DeleteChatMessageDto): void {
    this.chatRealtime.deleteMessage(message);
  }
}
