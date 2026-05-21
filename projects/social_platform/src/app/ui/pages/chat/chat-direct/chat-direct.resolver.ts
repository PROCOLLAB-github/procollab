/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ChatItem } from "@domain/chat/chat-item.model";
import { ChatGroupsRepositoryPort } from "@domain/chat/ports/chat-groups.port";

/**
 * Резолвер для загрузки данных конкретного прямого чата
 *
 * Извлекает chatId из параметров маршрута и загружает
 * информацию о чате через ChatGroupsRepositoryPort
 *
 * @param route - Снимок активного маршрута с параметрами
 * @returns {Observable<ChatItem>} Observable с данными чата
 */
/**
 * Резолвер для получения информации о прямом чате
 * Извлекает chatId из параметров маршрута и вызывает getDirect()
 */
export const ChatDirectResolver: ResolveFn<ChatItem> = (route: ActivatedRouteSnapshot) => {
  const chatGroupsRepository = inject(ChatGroupsRepositoryPort);

  const chatId = route.params["chatId"];

  return chatGroupsRepository.getChat(chatId);
};
