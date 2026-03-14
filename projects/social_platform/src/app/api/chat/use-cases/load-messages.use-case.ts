/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { ChatRepositoryPort } from "../../../domain/chat/ports/chat.repository.port";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { ChatMessage } from "../../../domain/chat/chat-message.model";

export type LoadMessagesError = { kind: "server_error" };

@Injectable({ providedIn: "root" })
export class LoadMessagesUseCase {
  private readonly chatRepository = inject(ChatRepositoryPort);

  execute(
    projectId: number,
    offset?: number,
    limit?: number
  ): Observable<Result<ApiPagination<ChatMessage>, LoadMessagesError>> {
    return this.chatRepository.loadMessages(projectId, offset, limit).pipe(
      map(page => ok<ApiPagination<ChatMessage>>(page)),
      catchError(() => of(fail<LoadMessagesError>({ kind: "server_error" })))
    );
  }
}
