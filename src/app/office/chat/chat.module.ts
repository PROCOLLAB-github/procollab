/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChatCardComponent } from "./shared/chat-card/chat-card.component";
import { ChatComponent } from "@office/chat/chat.component";
import { UiModule } from "@ui/ui.module";
import { FormsModule } from "@angular/forms";
import { CoreModule } from "@core/core.module";

@NgModule({
  imports: [CommonModule, UiModule, FormsModule, CoreModule, ChatComponent, ChatCardComponent],
})
export class ChatModule {}
