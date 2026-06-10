/** @format */

import { Provider } from "@angular/core";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { ChatRepositoryPort } from "@domain/chat/ports/chat.repository.port";
import { ChatRealtimeRepository } from "../repository/chat/chat-realtime.repository";
import { ChatRepository } from "../repository/chat/chat.repository";
import { ChatGroupsRepositoryPort } from "@domain/chat/ports/chat-groups.port";
import { ChatGroupsRepository } from "@infrastructure/repository/chat/chat-groups.repository";

export const CHAT_PROVIDERS: Provider[] = [
  { provide: ChatRepositoryPort, useExisting: ChatRepository },
  { provide: ChatRealtimePort, useExisting: ChatRealtimeRepository },
  { provide: ChatGroupsRepositoryPort, useExisting: ChatGroupsRepository },
];
