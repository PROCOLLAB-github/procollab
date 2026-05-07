/** @format */

import { Provider } from "@angular/core";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { ChatRepositoryPort } from "@domain/chat/ports/chat.repository.port";
import { ChatRealtimeRepository } from "../repository/chat/chat-realtime.repository";
import { ChatRepository } from "../repository/chat/chat.repository";

export const CHAT_PROVIDERS: Provider[] = [
  { provide: ChatRepositoryPort, useExisting: ChatRepository },
  { provide: ChatRealtimePort, useExisting: ChatRealtimeRepository },
];
