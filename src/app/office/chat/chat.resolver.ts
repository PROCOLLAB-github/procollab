/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable, tap } from "rxjs";
import { ChatDirectService } from "@office/chat/services/chat-direct.service";
import { ChatItem } from "@office/chat/models/chat-item.model";

@Injectable({
  providedIn: "root",
})
export class ChatResolver implements Resolve<ChatItem> {
  constructor(private readonly chatDirectService: ChatDirectService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ChatItem> {
    return this.chatDirectService.getDirects().pipe(tap(console.log));
  }
}
