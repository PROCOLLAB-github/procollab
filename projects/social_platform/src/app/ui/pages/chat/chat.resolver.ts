/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { ChatListItem } from "@domain/chat/chat-item.model";
import { ChatGroupsRepositoryPort } from "@domain/chat/ports/chat-groups.port";

/**
 * Резолвер для загрузки прямых чатов пользователя
 * Предзагружает список личных сообщений
 *
 * Принимает:
 * - Контекст маршрута через Angular DI
 *
 * Возвращает:
 * - Observable<ChatListItem[]> - список элементов прямых чатов
 */
export const ChatResolver: ResolveFn<ChatListItem[]> = () => {
  const chatGroupsRepository = inject(ChatGroupsRepositoryPort);

  return chatGroupsRepository.getChats("direct");
};
