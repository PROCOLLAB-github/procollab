/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Observable } from "rxjs";
import { ChatListItem } from "../../../domain/chat/chat-item.model";

/**
 * Сервис для работы с чатами проектов (групповыми чатами)
 *
 * Предоставляет методы для получения списка чатов проектов
 * через API сервис
 *
 * @Injectable providedIn: 'root' - синглтон на уровне приложения
 */
@Injectable({
  providedIn: "root",
})
export class ChatProjectService {
  private readonly CHATS_URL = "/chats";

  constructor(private readonly apiService: ApiService) {}

  /**
   * Получает список чатов проектов с сервера
   *
   * @returns {Observable<ChatListItem[]>} Observable со списком чатов проектов
   */
  getProjects(): Observable<ChatListItem[]> {
    return this.apiService.get(`${this.CHATS_URL}/projects/`);
  }
}
