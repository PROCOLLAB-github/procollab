/** @format */

import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { ChatDirectComponent } from "@office/chat/chat-direct/chat-direct/chat-direct.component";
import { ChatDirectResolver } from "@office/chat/chat-direct/chat-direct/chat-direct.resolver";

const routes: Routes = [
  {
    path: "",
    component: ChatDirectComponent,
    resolve: {
      data: ChatDirectResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatDirectRoutingModule {}
