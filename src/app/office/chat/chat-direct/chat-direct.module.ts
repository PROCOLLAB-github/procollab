/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChatDirectComponent } from "./chat-direct/chat-direct.component";
import { ChatDirectRoutingModule } from "@office/chat/chat-direct/chat-direct-routing.module";
import { OfficeModule } from "@office/office.module";
import { CoreModule } from "@core/core.module";
import { UiModule } from "@ui/ui.module";

@NgModule({
  declarations: [ChatDirectComponent],
  imports: [CommonModule, ChatDirectRoutingModule, OfficeModule, CoreModule, UiModule],
})
export class ChatDirectModule {}
