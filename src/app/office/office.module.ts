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
import { PeopleComponent } from "./people/people.component";
import { NewsComponent } from "./news/news.component";
import { ProfileDetailComponent } from "./profile/detail/profile-detail.component";
import { ProfileEditComponent } from "./profile/edit/profile-edit.component";

@NgModule({
  declarations: [
    OfficeComponent,
    HeaderComponent,
    NavComponent,
    ProjectsComponent,
    ChatComponent,
    PeopleComponent,
    NewsComponent,
    ProfileDetailComponent,
    ProfileEditComponent,
  ],
  imports: [OfficeRoutingModule, CommonModule, UiModule],
})
export class OfficeModule {}
