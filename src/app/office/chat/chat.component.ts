/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "@services/nav.service";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";
import { ChatListItem } from "@office/chat/models/chat-item.model";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit {
  constructor(private readonly navService: NavService, private readonly route: ActivatedRoute) {}

  chats: Observable<ChatListItem[]> = this.route.data.pipe(map(r => r["data"]));

  ngOnInit(): void {
    this.navService.setNavTitle("Чат");
  }
}
