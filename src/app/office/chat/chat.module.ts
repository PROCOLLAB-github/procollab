/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChatRoutingModule } from "@office/chat/chat-routing.module";
import { ChatCardComponent } from "./shared/chat-card/chat-card.component";
import { ChatComponent } from "@office/chat/chat.component";
import { UiModule } from "@ui/ui.module";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [ChatComponent, ChatCardComponent],
  imports: [ChatRoutingModule, CommonModule, UiModule, FormsModule],
})
export class ChatModule {}
