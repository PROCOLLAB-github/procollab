/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";

/** Сценарий (WS): установить WebSocket-соединение чата. */
@Injectable({ providedIn: "root" })
export class ConnectChatUseCase {
  private readonly chatRealtime = inject(ChatRealtimePort);

  execute() {
    return this.chatRealtime.connect();
  }
}
