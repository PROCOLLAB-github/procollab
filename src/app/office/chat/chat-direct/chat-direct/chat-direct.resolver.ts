/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { ChatDirectService } from "@office/chat/services/chat-direct.service";

@Injectable({
  providedIn: "root",
})
export class ChatDirectResolver implements Resolve<boolean> {
  constructor(private readonly chatDirectService: ChatDirectService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    const chatId = route.params["chatId"];
    return this.chatDirectService.getDirect(chatId);
  }
}
