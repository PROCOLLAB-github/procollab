/** @format */

import { inject, Injectable } from "@angular/core";
import { ChatItem, ChatListItem } from "@domain/chat/chat-item.model";
import { ChatGroupsRepositoryPort } from "@domain/chat/ports/chat-groups.port";
import { ChatGroupsHttpAdaper } from "@infrastructure/adapters/chat/chat-groups-http.adapter";
import { Observable } from "rxjs";

/** Репозиторий групповых чатов: список проектных групп через адаптер. */
@Injectable({ providedIn: "root" })
export class ChatGroupsRepository implements ChatGroupsRepositoryPort {
  private readonly chatGroupsHttpAdapter = inject(ChatGroupsHttpAdaper);

  getChats(type: "direct" | "projects"): Observable<ChatListItem[]> {
    return this.chatGroupsHttpAdapter.getChats(type);
  }

  getChat(chatId: string): Observable<ChatItem> {
    return this.chatGroupsHttpAdapter.getDirect(chatId);
  }
}
