/** @format */

import { Injectable, signal } from "@angular/core";
import { ChatListItem } from "projects/social_platform/src/app/domain/chat/chat-item.model";
import { OnChatMessageDto } from "projects/social_platform/src/app/domain/chat/chat.model";

@Injectable()
export class ChatUIInfoService {
  readonly chatsData = signal<ChatListItem[]>([]);

  applyInitializationMessages(result: OnChatMessageDto): void {
    this.chatsData.update(list => {
      const idx = list.findIndex(c => c.id === result.chatId);
      if (idx === -1) return list;

      return list.map((chat, i) => (i === idx ? { ...chat, lastMessage: result.message } : chat));
    });
  }
}
