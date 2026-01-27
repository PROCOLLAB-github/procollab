/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { ChatListItem } from "../../../domain/chat/chat-item.model";
import { ChatDirectService } from "../../../api/chat/chat-direct/chat-direct.service";

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
  const chatDirectService = inject(ChatDirectService);

  return chatDirectService.getDirects();
};
