/** @format */

import { Injectable } from "@angular/core";
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";
import { ChatProjectService } from "@office/chat/services/chat-project.service";
import { ChatListItem } from "@office/chat/models/chat-item.model";

@Injectable({
  providedIn: "root",
})
export class ChatGroupsResolver  {
  constructor(private readonly chatProjectService: ChatProjectService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ChatListItem[]> {
    return this.chatProjectService.getProjects();
  }
}
