/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { TypingInChatDto } from "@domain/chat/chat.model";

@Injectable({ providedIn: "root" })
export class StartTypingUseCase {
  private readonly chatRealtime = inject(ChatRealtimePort);

  execute(typing: TypingInChatDto): void {
    this.chatRealtime.startTyping(typing);
  }
}
