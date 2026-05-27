/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatFile, ChatMessage } from "@domain/chat/chat-message.model";
import { ChatRepositoryPort } from "@domain/chat/ports/chat.repository.port";
import { ChatHttpAdapter } from "../../adapters/chat/chat-http.adapter";
import { plainToInstance } from "class-transformer";
import { map } from "rxjs";
import { userFromRaw } from "@utils/userRaw";

/** Репозиторий чата (REST): история, файлы, флаг непрочитанных; `plainToInstance`. */
@Injectable({ providedIn: "root" })
export class ChatRepository implements ChatRepositoryPort {
  private readonly chatHttpAdapter = inject(ChatHttpAdapter);

  loadMessages(id: number, type: "directs" | "projects", offset?: number, limit?: number) {
    return this.chatHttpAdapter.loadMessages(id, type, offset, limit).pipe(
      map(page => ({
        ...page,
        results: page.results.map(mapChatMessage).filter((message): message is ChatMessage => message !== null),
      }))
    );
  }

  loadProjectFiles(projectId: number) {
    return this.chatHttpAdapter
      .loadProjectFiles(projectId)
      .pipe(map(files => plainToInstance(ChatFile, files)));
  }

  hasUnreads() {
    return this.chatHttpAdapter.hasUnreads().pipe(map(response => response.hasUnreads));
  }
}

export function mapChatMessage(message: ChatMessage | null | undefined): ChatMessage | null {
  if (!message) return null;
  return {
    ...message,
    author: message.author ? userFromRaw(message.author) : message.author,
    replyTo: message.replyTo ? mapChatMessage(message.replyTo) : message.replyTo,
  };
}
