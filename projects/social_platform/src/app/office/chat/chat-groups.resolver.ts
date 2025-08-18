/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { ChatProjectService } from "@office/chat/services/chat-project.service";
import { ChatListItem } from "@office/chat/models/chat-item.model";

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
