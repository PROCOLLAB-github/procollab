/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";

/** Событие (WS): поток удалений сообщений. */
@Injectable({ providedIn: "root" })
export class ObserveDeleteMessageUseCase {
  private readonly chatRealtime = inject(ChatRealtimePort);

  execute() {
    return this.chatRealtime.onDeleteMessage();
  }
}
