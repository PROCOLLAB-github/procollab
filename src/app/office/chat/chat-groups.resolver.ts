/** @format */

import { Injectable } from "@angular/core";
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";
import { ChatProjectService } from "@office/chat/services/chat-project.service";
import { ChatListItem } from "@office/chat/models/chat-item.model";

@Injectable({
  providedIn: "root",
})
export class ChatGroupsResolver implements Resolve<ChatListItem[]> {
  constructor(private readonly chatProjectService: ChatProjectService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ChatListItem[]> {
    return this.chatProjectService.getProjects();
  }
}
