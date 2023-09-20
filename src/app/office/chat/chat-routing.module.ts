/** @format */

import { RouterModule, Routes } from "@angular/router";
import { ChatComponent } from "@office/chat/chat.component";
import { NgModule } from "@angular/core";
import { ChatResolver } from "@office/chat/chat.resolver";
import { ChatGroupsResolver } from "@office/chat/chat-groups.resolver";

const routes: Routes = [
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
    loadChildren: () => import("./chat-direct/chat-direct.module").then(m => m.ChatDirectModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatRoutingModule {}
