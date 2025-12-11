/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { ChatListItem } from "../../../domain/chat/chat-item.model";
import { ChatProjectService } from "../../../api/chat/chat-projects/chat-project.service";

/**
 * Резолвер для загрузки групповых чатов (проектных чатов)
 * Предзагружает список проектных чатов для пользователя
 *
 * Принимает:
 * - Контекст маршрута через Angular DI
 *
 * Возвращает:
 * - Observable<ChatListItem[]> - список элементов групповых чатов
 */
export const ChatGroupsResolver: ResolveFn<ChatListItem[]> = () => {
  const chatProjectService = inject(ChatProjectService);

  return chatProjectService.getProjects();
};
