/** @format */

import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CoreModule } from "@core/core.module";
import { UiModule } from "@ui/ui.module";
import { ProfileDetailRoutingModule } from "./profile-detail-routing.module";
import { OfficeModule } from "@office/office.module";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { LayoutModule } from "@angular/cdk/layout";
import { ReactiveFormsModule } from "@angular/forms";
import { ClickOutsideModule } from "ng-click-outside";
import { AutosizeModule } from "ngx-autosize";
import { ProfileMainComponent } from "./main/main.component";
import { ProjectsModule } from "@office/projects/projects.module";
import { ProfileProjectsComponent } from "./projects/projects.component";

@NgModule({
    imports: [
        UiModule,
        CoreModule,
        CommonModule,
        ProfileDetailRoutingModule,
        OfficeModule,
        ScrollingModule,
        LayoutModule,
        ReactiveFormsModule,
        ClickOutsideModule,
        AutosizeModule,
        ProjectsModule,
        ProfileMainComponent, ProfileProjectsComponent,
    ],
})
export class ProfileDetailModule {}
