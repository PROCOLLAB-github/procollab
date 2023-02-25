/** @format */

import { NgModule } from "@angular/core";
import { ProjectDetailRoutingModule } from "./detail-routing.module";
import { UiModule } from "../../../ui/ui.module";
import { CoreModule } from "../../../core/core.module";
import { CommonModule } from "@angular/common";
import { ProjectInfoComponent } from "./info/info.component";
import { ProjectResponsesComponent } from "./responses/responses.component";
import { ResponseCardComponent } from "../../shared/response-card/response-card.component";
import { ProjectDetailComponent } from "./detail.component";
import { ProjectChatComponent } from "./chat/chat.component";
import { OfficeModule } from "@office/office.module";

@NgModule({
  imports: [UiModule, CoreModule, CommonModule, ProjectDetailRoutingModule, OfficeModule],
  declarations: [
    ProjectInfoComponent,
    ProjectResponsesComponent,
    ResponseCardComponent,
    ProjectDetailComponent,
    ProjectChatComponent,
  ],
})
export class ProjectDetailModule {}
