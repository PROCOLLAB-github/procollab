/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ChatItem } from "@domain/chat/chat-item.model";
import { ChatGroupsRepositoryPort } from "@domain/chat/ports/chat-groups.port";

/** Предзагружает данные конкретного прямого чата. */
export const ChatDirectResolver: ResolveFn<ChatItem> = (route: ActivatedRouteSnapshot) => {
  const chatGroupsRepository = inject(ChatGroupsRepositoryPort);

  const chatId = route.params["chatId"];

  return chatGroupsRepository.getChat(chatId);
};
