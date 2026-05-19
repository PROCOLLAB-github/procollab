/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";

/** Событие (WS): поток новых сообщений. */
@Injectable({ providedIn: "root" })
export class ObserveMessagesUseCase {
  private readonly chatRealtime = inject(ChatRealtimePort);

  execute() {
    return this.chatRealtime.onMessage();
  }
}
