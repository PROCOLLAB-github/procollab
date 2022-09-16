/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OfficeRoutingModule } from "./office-routing.module";
import { OfficeComponent } from "./office.component";
import { HeaderComponent } from "./shared/header/header.component";
import { UiModule } from "../ui/ui.module";
import { NavComponent } from "./shared/nav/nav.component";
import { ProjectsComponent } from "./projects/projects.component";
import { ChatComponent } from "./chat/chat.component";
import { NewsAllComponent } from "./news/all/all.component";
import { ProfileDetailComponent } from "./profile/detail/profile-detail.component";
import { ProfileEditComponent } from "./profile/edit/edit.component";
import { CoreModule } from "../core/core.module";
import { ReactiveFormsModule } from "@angular/forms";
import { MembersComponent } from "./members/members.component";
import { MemberCardComponent } from "./shared/member-card/member-card.component";
import { ProjectCardComponent } from "./shared/project-card/project-card.component";
import { ProjectsListComponent } from "./projects/list/list.component";
import { ProjectDetailComponent } from "./projects/detail/detail.component";
import { ProjectEditComponent } from "./projects/edit/edit.component";
import { VacancyCardComponent } from "./shared/vacancy-card/vacancy-card.component";
import { InviteCardComponent } from "./shared/invite-card/invite-card.component";
import { AdvertCardComponent } from "./shared/advert-card/advert-card.component";
import { NewsDetailComponent } from "./news/detail/detail.component";
import { VacancySendComponent } from "./vacancy/send/send.component";
import { InviteManageCardComponent } from "./shared/invite-manage-card/invite-manage-card.component";
import { ClickOutsideModule } from "ng-click-outside";
import { ProjectResponsesComponent } from "./projects/responses/responses.component";
import { ResponseCardComponent } from "./shared/response-card/response-card.component";

@NgModule({
  declarations: [
    OfficeComponent,
    HeaderComponent,
    NavComponent,
    ProjectsComponent,
    ChatComponent,
    NewsAllComponent,
    ProfileDetailComponent,
    ProfileEditComponent,
    MembersComponent,
    MemberCardComponent,
    ProjectCardComponent,
    ProjectsListComponent,
    ProjectDetailComponent,
    ProjectEditComponent,
    VacancyCardComponent,
    InviteCardComponent,
    AdvertCardComponent,
    NewsDetailComponent,
    VacancySendComponent,
    InviteManageCardComponent,
    ProjectResponsesComponent,
    ResponseCardComponent,
  ],
  imports: [
    OfficeRoutingModule,
    CommonModule,
    UiModule,
    CoreModule,
    ClickOutsideModule,
    ReactiveFormsModule,
  ],
})
export class OfficeModule {}
