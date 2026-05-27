/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { ChatListItem } from "@domain/chat/chat-item.model";
import { ChatGroupsRepositoryPort } from "@domain/chat/ports/chat-groups.port";

/** Предзагружает список прямых чатов пользователя. */
export const ChatResolver: ResolveFn<ChatListItem[]> = () => {
  const chatGroupsRepository = inject(ChatGroupsRepositoryPort);

  return chatGroupsRepository.getChats("direct");
};
