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

  /**
   * Получает список чатов проектов с сервера или всех прямых чатов пользователя
   * в зависимости от type
   *
   * @returns {Observable<ChatListItem[]>} Observable со списком чатов проектов
   */
  getChats(type: "direct" | "projects"): Observable<ChatListItem[]> {
    return this.apiService.get(`${this.CHATS_URL}/${type}/`);
  }

  /**
   * Получает детальную информацию о конкретном прямом чате
   *
   * @param chatId - Идентификатор чата
   * @returns {Observable<ChatItem>} Observable с информацией о чате
   */
  getDirect(chatId: string): Observable<ChatItem> {
    return this.apiService.get(`${this.CHATS_URL}/directs/${chatId}/`);
  }
}
