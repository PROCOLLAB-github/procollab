/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { EditChatMessageDto } from "@domain/chat/chat.model";

@Injectable({ providedIn: "root" })
export class EditMessageUseCase {
  private readonly chatRealtime = inject(ChatRealtimePort);

  execute(message: EditChatMessageDto): void {
    this.chatRealtime.editMessage(message);
  }
}
