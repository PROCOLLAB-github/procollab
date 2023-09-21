/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { OfficeRoutingModule } from "./office-routing.module";
import { OfficeComponent } from "./office.component";
import { HeaderComponent } from "./shared/header/header.component";
import { UiModule } from "@ui/ui.module";
import { NavComponent } from "./shared/nav/nav.component";
import { ProfileDetailComponent } from "./profile/detail/profile-detail.component";
import { ProfileEditComponent } from "./profile/edit/edit.component";
import { CoreModule } from "@core/core.module";
import { ReactiveFormsModule } from "@angular/forms";
import { MembersComponent } from "./members/members.component";
import { MemberCardComponent } from "./shared/member-card/member-card.component";
import { AdvertCardComponent } from "./shared/advert-card/advert-card.component";
import { ClickOutsideModule } from "ng-click-outside";
import { MentorsComponent } from "./mentors/mentors.component";
import { ProjectsModule } from "./projects/projects.module";
import { InviteManageCardComponent } from "./shared/invite-manage-card/invite-manage-card.component";
import { MessageInputComponent } from "./shared/message-input/message-input.component";
import { NgxMaskModule } from "ngx-mask";
import { AutosizeModule } from "ngx-autosize";
import { SidebarComponent } from "./shared/sidebar/sidebar.component";
import { ImgCardComponent } from "@office/shared/img-card/img-card.component";
import { ChatWindowComponent } from "./shared/chat-window/chat-window.component";
import { ScrollingModule } from "@angular/cdk/scrolling";

@NgModule({
  declarations: [
    OfficeComponent,
    HeaderComponent,
    NavComponent,
    InviteManageCardComponent,
    ProfileDetailComponent,
    ProfileEditComponent,
    MembersComponent,
    MentorsComponent,
    MemberCardComponent,
    AdvertCardComponent,
    MessageInputComponent,
    SidebarComponent,
    ImgCardComponent,
    ChatWindowComponent,
  ],
  imports: [
    OfficeRoutingModule,
    ProjectsModule,
    CommonModule,
    UiModule,
    CoreModule,
    ClickOutsideModule,
    ReactiveFormsModule,
    NgxMaskModule,
    AutosizeModule,
    ScrollingModule,
  ],
  exports: [MessageInputComponent, ImgCardComponent, MemberCardComponent, ChatWindowComponent],
})
export class OfficeModule {}
