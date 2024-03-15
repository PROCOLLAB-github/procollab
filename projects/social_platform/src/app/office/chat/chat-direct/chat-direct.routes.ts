/** @format */

import { Routes } from "@angular/router";
import { ChatDirectComponent } from "@office/chat/chat-direct/chat-direct/chat-direct.component";
import { ChatDirectResolver } from "@office/chat/chat-direct/chat-direct/chat-direct.resolver";

export const CHAT_DIRECT_ROUTES: Routes = [
  {
    path: "",
    component: ChatDirectComponent,
    resolve: {
      data: ChatDirectResolver,
    },
  },
];
