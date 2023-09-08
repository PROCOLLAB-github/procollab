/** @format */

import { RouterModule, Routes } from "@angular/router";
import { ChatComponent } from "@office/chat/chat.component";
import { NgModule } from "@angular/core";
import { ChatResolver } from "@office/chat/chat.resolver";

const routes: Routes = [
  {
    path: "",
    component: ChatComponent,
    resolve: {
      data: ChatResolver,
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
