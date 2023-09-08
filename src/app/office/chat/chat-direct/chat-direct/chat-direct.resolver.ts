/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { ChatDirectService } from "@office/chat/services/chat-direct.service";
import { ChatItem } from "@office/chat/models/chat-item.model";

@Injectable({
  providedIn: "root",
})
export class ChatDirectResolver implements Resolve<ChatItem> {
  constructor(private readonly chatDirectService: ChatDirectService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ChatItem> {
    const chatId = route.params["chatId"];
    return this.chatDirectService.getDirect(chatId);
  }
}
