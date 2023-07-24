/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProgramDetailRoutingModule } from "@office/program/detail/detail-routing.module";
import { ProgramDetailComponent } from "./detail/detail.component";
import { UiModule } from "@ui/ui.module";
import { ProgramDetailMainComponent } from "./main/main.component";
import { CoreModule } from "@core/core.module";
import { ProgramRegisterComponent } from "./register/register.component";
import { ReactiveFormsModule } from "@angular/forms";
import { ProgramProjectsComponent } from "./projects/projects.component";
import { ProjectsModule } from "@office/projects/projects.module";
import { ProgramModule } from "@office/program/program.module";
import { ProgramMembersComponent } from "./members/members.component";
import { OfficeModule } from "@office/office.module";

@NgModule({
  declarations: [
    ProgramDetailComponent,
    ProgramDetailMainComponent,
    ProgramRegisterComponent,
    ProgramProjectsComponent,
    ProgramMembersComponent,
  ],
  imports: [
    CommonModule,
    ProgramDetailRoutingModule,
    UiModule,
    CoreModule,
    ReactiveFormsModule,
    ProjectsModule,
    ProgramModule,
    OfficeModule,
  ],
})
export class ProgramDetailModule {}
