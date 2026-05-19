/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";

/** Событие (WS): поток индикатора «печатает». */
@Injectable({ providedIn: "root" })
export class ObserveTypingUseCase {
  private readonly chatRealtime = inject(ChatRealtimePort);

  execute() {
    return this.chatRealtime.onTyping();
  }
}
