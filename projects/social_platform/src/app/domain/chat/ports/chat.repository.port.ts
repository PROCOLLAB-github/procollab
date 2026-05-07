/** @format */

import { Observable } from "rxjs";
import { ApiPagination } from "../../other/api-pagination.model";
import { ChatFile, ChatMessage } from "../chat-message.model";

/**
 * Порт для HTTP-операций чата (REST API).
 * Загрузка истории сообщений, файлов, проверка непрочитанных.
 */
export abstract class ChatRepositoryPort {
  abstract loadMessages(
    projectId: number,
    offset?: number,
    limit?: number
  ): Observable<ApiPagination<ChatMessage>>;

  abstract loadProjectFiles(projectId: number): Observable<ChatFile[]>;

  abstract hasUnreads(): Observable<boolean>;
}
