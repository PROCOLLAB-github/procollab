/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ChatDirectService } from "@office/chat/services/chat-direct.service";
import { ChatItem } from "@office/chat/models/chat-item.model";

/**
 * Резолвер для загрузки данных конкретного прямого чата
 *
 * Извлекает chatId из параметров маршрута и загружает
 * информацию о чате через ChatDirectService
 *
 * @param route - Снимок активного маршрута с параметрами
 * @returns {Observable<ChatItem>} Observable с данными чата
 */
/**
 * Резолвер для получения информации о прямом чате
 * Извлекает chatId из параметров маршрута и вызывает getDirect()
 */
export const ChatDirectResolver: ResolveFn<ChatItem> = (route: ActivatedRouteSnapshot) => {
  const chatDirectService = inject(ChatDirectService);

  const chatId = route.params["chatId"];

  return chatDirectService.getDirect(chatId);
};
