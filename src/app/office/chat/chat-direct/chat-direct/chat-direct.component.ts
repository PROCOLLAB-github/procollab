/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Subscription } from "rxjs";
import { ChatItem } from "@office/chat/models/chat-item.model";

@Component({
  selector: "app-chat-direct",
  templateUrl: "./chat-direct.component.html",
  styleUrls: ["./chat-direct.component.scss"],
})
export class ChatDirectComponent implements OnInit, OnDestroy {
  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const routeData$ = this.route.data.pipe(map(r => r["data"])).subscribe(chat => {
      this.chat = chat;
    });
    this.subscriptions$.push(routeData$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  subscriptions$: Subscription[] = [];

  chat?: ChatItem;
}
