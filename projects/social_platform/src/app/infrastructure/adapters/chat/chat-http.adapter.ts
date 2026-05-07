/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { ChatFile, ChatMessage } from "@domain/chat/chat-message.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class ChatHttpAdapter {
  private readonly apiService = inject(ApiService);
  private readonly chatsUrl = "/chats";

  loadMessages(
    projectId: number,
    offset?: number,
    limit?: number
  ): Observable<ApiPagination<ChatMessage>> {
    let queries = new HttpParams();
    if (offset !== undefined) queries = queries.set("offset", offset);
    if (limit !== undefined) queries = queries.set("limit", limit);

    return this.apiService.get<ApiPagination<ChatMessage>>(
      `${this.chatsUrl}/projects/${projectId}/messages/`,
      queries
    );
  }

  loadProjectFiles(projectId: number): Observable<ChatFile[]> {
    return this.apiService.get<ChatFile[]>(`${this.chatsUrl}/projects/${projectId}/files`);
  }

  hasUnreads(): Observable<{ hasUnreads: boolean }> {
    return this.apiService.get<{ hasUnreads: boolean }>(`${this.chatsUrl}/has-unreads`);
  }
}
