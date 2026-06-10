/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@core/public-api";
import { ChatItem, ChatListItem } from "@domain/chat/chat-item.model";
import { Observable } from "rxjs";

/** HTTP-адаптер групповых чатов: `/chats` (опечатка в имени: Adaper). */
@Injectable({ providedIn: "root" })
export class ChatGroupsHttpAdaper {
  private readonly CHATS_URL = "/chats";
  private readonly apiService = inject(ApiService);

  getChats(type: "direct" | "projects"): Observable<ChatListItem[]> {
    return this.apiService.get(`${this.CHATS_URL}/${type}/`);
  }

  getDirect(chatId: string): Observable<ChatItem> {
    return this.apiService.get(`${this.CHATS_URL}/directs/${chatId}/`);
  }
}
