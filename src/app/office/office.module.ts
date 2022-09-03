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
import { NewsComponent } from "./news/news.component";
import { ProfileDetailComponent } from "./profile/detail/profile-detail.component";
import { ProfileEditComponent } from "./profile/edit/profile-edit.component";
import { CoreModule } from "../core/core.module";
import { ReactiveFormsModule } from "@angular/forms";
import { MembersComponent } from "./members/members.component";
import { MemberCardComponent } from "./shared/member-card/member-card.component";
import { ProjectCardComponent } from "./shared/project-card/project-card.component";
import { ProjectsListComponent } from "./projects/list/list.component";

@NgModule({
  declarations: [
    OfficeComponent,
    HeaderComponent,
    NavComponent,
    ProjectsComponent,
    ChatComponent,
    NewsComponent,
    ProfileDetailComponent,
    ProfileEditComponent,
    MembersComponent,
    MemberCardComponent,
    ProjectCardComponent,
    ProjectsListComponent,
  ],
  imports: [OfficeRoutingModule, CommonModule, UiModule, CoreModule, ReactiveFormsModule],
})
export class OfficeModule {}
