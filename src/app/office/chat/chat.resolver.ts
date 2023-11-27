/** @format */

import { inject } from "@angular/core";
import { ChatDirectService } from "@office/chat/services/chat-direct.service";
import { ChatListItem } from "@office/chat/models/chat-item.model";
import { ResolveFn } from "@angular/router";

export const ChatResolver: ResolveFn<ChatListItem[]> = () => {
  const chatDirectService = inject(ChatDirectService);

  return chatDirectService.getDirects();
};
