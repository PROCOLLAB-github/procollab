/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { ChatProjectService } from "@office/chat/services/chat-project.service";
import { ChatListItem } from "@office/chat/models/chat-item.model";

export const ChatGroupsResolver: ResolveFn<ChatListItem[]> = () => {
  const chatProjectService = inject(ChatProjectService);

  return chatProjectService.getProjects();
};
