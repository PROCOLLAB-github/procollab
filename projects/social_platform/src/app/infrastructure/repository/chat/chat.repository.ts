/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatFile } from "@domain/chat/chat-message.model";
import { ChatRepositoryPort } from "@domain/chat/ports/chat.repository.port";
import { ChatHttpAdapter } from "../../adapters/chat/chat-http.adapter";
import { plainToInstance } from "class-transformer";
import { map } from "rxjs";

@Injectable({ providedIn: "root" })
export class ChatRepository implements ChatRepositoryPort {
  private readonly chatHttpAdapter = inject(ChatHttpAdapter);

  loadMessages(projectId: number, offset?: number, limit?: number) {
    return this.chatHttpAdapter.loadMessages(projectId, offset, limit);
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
