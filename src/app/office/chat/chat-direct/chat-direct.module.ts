/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChatDirectComponent } from "./chat-direct/chat-direct.component";
import { ChatDirectRoutingModule } from "@office/chat/chat-direct/chat-direct-routing.module";

@NgModule({
  declarations: [ChatDirectComponent],
  imports: [CommonModule, ChatDirectRoutingModule],
})
export class ChatDirectModule {}
