/** @format */

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
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
import { ProgramNewsCardComponent } from "./shared/news-card/news-card.component";

@NgModule({
  imports: [
    CommonModule,
    UiModule,
    CoreModule,
    ReactiveFormsModule,
    ProjectsModule,
    ProgramModule,
    OfficeModule,
    ProgramDetailComponent,
    ProgramDetailMainComponent,
    ProgramRegisterComponent,
    ProgramProjectsComponent,
    ProgramMembersComponent,
    ProgramNewsCardComponent,
  ],
  exports: [ProgramNewsCardComponent],
})
export class ProgramDetailModule {}
