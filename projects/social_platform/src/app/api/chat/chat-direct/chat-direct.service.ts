/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { ChatMessage } from "projects/social_platform/src/app/domain/chat/chat-message.model";
import { ChatItem, ChatListItem } from "../../../domain/chat/chat-item.model";

/**
 * Сервис для работы с прямыми чатами (личными сообщениями)
 *
 * Предоставляет методы для:
 * - Получения списка прямых чатов
 * - Получения информации о конкретном чате
 * - Загрузки сообщений чата с пагинацией
 *
 * @Injectable providedIn: 'root' - синглтон на уровне приложения
 */
@Injectable({
  providedIn: "root",
})
export class ChatDirectService {
  private readonly CHATS_URL = "/chats";

  constructor(private readonly apiService: ApiService) {}

  /**
   * Получает список всех прямых чатов пользователя
   *
   * @returns {Observable<ChatListItem[]>} Observable со списком прямых чатов
   */
  getDirects(): Observable<ChatListItem[]> {
    return this.apiService.get(`${this.CHATS_URL}/directs/`);
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

  /**
   * Загружает сообщения чата с поддержкой пагинации
   *
   * @param chatId - Идентификатор чата
   * @param count - Смещение (количество уже загруженных сообщений)
   * @param take - Количество сообщений для загрузки
   * @returns {Observable<ApiPagination<ChatMessage>>} Observable с пагинированным списком сообщений
   */
  loadMessages(
    chatId: string,
    count?: number,
    take?: number
  ): Observable<ApiPagination<ChatMessage>> {
    let queries = new HttpParams();
    if (count !== undefined) queries = queries.set("offset", count);
    if (take !== undefined) queries = queries.set("limit", take);

    return this.apiService.get<ApiPagination<ChatMessage>>(
      `${this.CHATS_URL}/directs/${chatId}/messages/`,
      queries
    );
  }
}
