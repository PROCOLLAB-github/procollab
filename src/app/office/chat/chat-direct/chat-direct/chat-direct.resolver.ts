/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ChatDirectService } from "@office/chat/services/chat-direct.service";
import { ChatItem } from "@office/chat/models/chat-item.model";

export const ChatDirectResolver: ResolveFn<ChatItem> = (route: ActivatedRouteSnapshot) => {
  const chatDirectService = inject(ChatDirectService);

  const chatId = route.params["chatId"];

  return chatDirectService.getDirect(chatId);
};
