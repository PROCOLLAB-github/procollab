/** @format */

import { NgModule } from "@angular/core";
import { ProjectDetailRoutingModule } from "./detail-routing.module";
import { UiModule } from "@ui/ui.module";
import { CoreModule } from "@core/core.module";
import { CommonModule } from "@angular/common";
import { ProjectInfoComponent } from "./info/info.component";
import { ProjectResponsesComponent } from "./responses/responses.component";
import { ResponseCardComponent } from "../../shared/response-card/response-card.component";
import { ProjectDetailComponent } from "./detail.component";
import { ProjectChatComponent } from "./chat/chat.component";
import { OfficeModule } from "@office/office.module";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { ReactiveFormsModule } from "@angular/forms";
import { NewsCardComponent } from "./shared/news-card/news-card.component";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { ClickOutsideModule } from "ng-click-outside";
import { NewsFormComponent } from "./shared/news-form/news-form.component";
import { AutosizeModule } from "ngx-autosize";
import { EditNewsCardComponent } from "./shared/edit-news-card/edit-news-card.component";

@NgModule({
  imports: [
    UiModule,
    CoreModule,
    CommonModule,
    ProjectDetailRoutingModule,
    OfficeModule,
    ScrollingModule,
    ReactiveFormsModule,
    ClickOutsideModule,
    AutosizeModule,
  ],
  providers: [ProjectNewsService],
  declarations: [
    ProjectInfoComponent,
    ProjectResponsesComponent,
    ResponseCardComponent,
    ProjectDetailComponent,
    ProjectChatComponent,
    NewsCardComponent,
    NewsFormComponent,
    EditNewsCardComponent,
  ],
})
export class ProjectDetailModule {}
