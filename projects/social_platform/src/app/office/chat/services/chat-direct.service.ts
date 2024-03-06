/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { Observable } from "rxjs";
import { ChatItem, ChatListItem } from "@office/chat/models/chat-item.model";
import { LoadChatMessages } from "@models/chat.model";
import { HttpParams } from "@angular/common/http";

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

  loadMessages(chatId: string, count?: number, take?: number): Observable<LoadChatMessages> {
    let queries = new HttpParams();
    if (count !== undefined) queries = queries.set("offset", count);
    if (take !== undefined) queries = queries.set("limit", take);

    return this.apiService.get<LoadChatMessages>(`/chats/directs/${chatId}/messages/`, queries);
  }
}
