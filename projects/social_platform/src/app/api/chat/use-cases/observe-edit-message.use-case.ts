/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";

/** Событие (WS): поток правок сообщений. */
@Injectable({ providedIn: "root" })
export class ObserveEditMessageUseCase {
  private readonly chatRealtime = inject(ChatRealtimePort);

  execute() {
    return this.chatRealtime.onEditMessage();
  }
}
