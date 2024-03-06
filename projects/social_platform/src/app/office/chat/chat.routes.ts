/** @format */

import { Routes } from "@angular/router";
import { ChatComponent } from "@office/chat/chat.component";
import { ChatResolver } from "@office/chat/chat.resolver";
import { ChatGroupsResolver } from "@office/chat/chat-groups.resolver";

export const CHAT_ROUTES: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "directs",
  },
  {
    path: "directs",
    component: ChatComponent,
    resolve: {
      data: ChatResolver,
    },
  },
  {
    path: "groups",
    component: ChatComponent,
    resolve: {
      data: ChatGroupsResolver,
    },
  },
  {
    path: ":chatId",
    loadChildren: () => import("./chat-direct/chat-direct.routes").then(c => c.CHAT_DIRECT_ROUTES),
  },
];
