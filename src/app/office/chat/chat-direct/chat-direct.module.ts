/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChatDirectComponent } from "./chat-direct/chat-direct.component";
import { OfficeModule } from "@office/office.module";
import { CoreModule } from "@core/core.module";
import { UiModule } from "@ui/ui.module";

@NgModule({
  imports: [CommonModule, OfficeModule, CoreModule, UiModule, ChatDirectComponent],
})
export class ChatDirectModule {}
