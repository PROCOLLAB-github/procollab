/** @format */

import { Observable } from "rxjs";
import { ChatItem, ChatListItem } from "../chat-item.model";

export abstract class ChatGroupsRepositoryPort {
  abstract getChats(type: "direct" | "projects"): Observable<ChatListItem[]>;
  abstract getChat(chatId: string): Observable<ChatItem>;
}
