/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { Observable } from "rxjs";
import { ChatItem, ChatListItem } from "@office/chat/models/chat-item.model";

@Injectable({
  providedIn: "root",
})
export class ChatDirectService {
  constructor(private readonly apiService: ApiService) {}

  getDirects(): Observable<ChatListItem[]> {
    return this.apiService.get("/chats/directs/");
  }

  getDirect(chatId: string): Observable<ChatItem> {
    return this.apiService.get(`/chats/directs/${chatId}/`);
  }
}
