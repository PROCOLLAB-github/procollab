/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Observable } from "rxjs";
import { ChatListItem } from "@office/chat/models/chat-item.model";

@Injectable({
  providedIn: "root",
})
export class ChatProjectService {
  constructor(private readonly apiService: ApiService) {}

  getProjects(): Observable<ChatListItem[]> {
    return this.apiService.get("/chats/projects/");
  }
}
