/** @format */

import { RouterModule, Routes } from "@angular/router";
import { ChatComponent } from "@office/chat/chat.component";
import { NgModule } from "@angular/core";

const routes: Routes = [
  {
    path: "",
    component: ChatComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatRoutingModule {}
