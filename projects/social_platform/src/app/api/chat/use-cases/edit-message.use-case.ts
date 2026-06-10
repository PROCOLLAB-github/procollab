/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { EditChatMessageDto } from "@domain/chat/chat.model";

/** Команда (WS): отредактировать сообщение. */
@Injectable({ providedIn: "root" })
export class EditMessageUseCase {
  private readonly chatRealtime = inject(ChatRealtimePort);

  execute(message: EditChatMessageDto): void {
    this.chatRealtime.editMessage(message);
  }
}
